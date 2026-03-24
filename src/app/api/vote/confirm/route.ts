import { NextRequest, NextResponse } from 'next/server';
import { getPendingVoteByToken, deletePendingVote, submitVote, hasVotedByEmail } from '@/lib/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant.' }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({ error: 'Firebase non configuré.' }, { status: 503 });
  }

  try {
    const pending = await getPendingVoteByToken(token);

    if (!pending) {
      return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 404 });
    }

    // Check expiry
    if (new Date(pending.expiresAt) < new Date()) {
      await deletePendingVote(pending.docId);
      return NextResponse.json({ error: 'Ce lien a expiré. Recommencez le vote.' }, { status: 410 });
    }

    // Check email not already voted (race condition protection)
    const alreadyVoted = await hasVotedByEmail(pending.voterEmail);
    if (alreadyVoted) {
      await deletePendingVote(pending.docId);
      return NextResponse.json({ error: 'Ce vote a déjà été confirmé.' }, { status: 409 });
    }

    // Save vote
    const voteId = await submitVote({
      eventId: pending.eventId,
      voterName: pending.voterName,
      voterTiktok: pending.voterTiktok,
      voterEmail: pending.voterEmail,
      answers: pending.answers,
      ipHash: pending.ipHash,
    });

    // Delete pending vote
    await deletePendingVote(pending.docId);

    return NextResponse.json({
      success: true,
      voteId,
      voterName: pending.voterName,
      answers: pending.answers,
    });
  } catch (error) {
    console.error('Confirm vote error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
