import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { submitVote, hasVotedByEmail, deleteVoteAccess, getVoteAccessByToken } from '@/lib/firestore';
import { sendRecapEmail } from '@/lib/email';
import { db } from '@/lib/firebase';

function getIpHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return createHash('sha256').update(ip).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, voterName, voterEmail, answers, token } = await req.json();

    if (!voterName?.trim() || !voterEmail?.trim()) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Aucun vote fourni.' }, { status: 400 });
    }

    const email = voterEmail.trim().toLowerCase();

    // No Firebase → dev mode
    if (!db) {
      sendRecapEmail(email, voterName.trim(), answers);
      return NextResponse.json({ success: true, mode: 'dev' });
    }

    // Check already voted
    const alreadyVoted = await hasVotedByEmail(email);
    if (alreadyVoted) {
      return NextResponse.json(
        { error: 'Tu as déjà voté avec cet email.' },
        { status: 429 }
      );
    }

    const ipHash = getIpHash(req);

    // Save vote
    await submitVote({
      eventId: eventId || 'demo',
      voterName: voterName.trim(),
      voterEmail: email,
      answers,
      ipHash,
    });

    // Delete access token
    if (token) {
      try {
        const access = await getVoteAccessByToken(token);
        if (access) await deleteVoteAccess(access.docId);
      } catch { /* non-blocking */ }
    }

    // Send recap email (awaited so Vercel doesn't kill it before it sends)
    await sendRecapEmail(email, voterName.trim(), answers);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submit vote error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
