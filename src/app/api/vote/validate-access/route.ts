import { NextRequest, NextResponse } from 'next/server';
import { getVoteAccessByToken, hasVotedByEmail } from '@/lib/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant.' }, { status: 400 });
  }

  // Dev mode — token carries name+email in URL
  const devMode = searchParams.get('dev') === '1';
  if (devMode || !db) {
    const name = searchParams.get('name') || 'Votant';
    const email = searchParams.get('email') || '';
    return NextResponse.json({ success: true, voterName: name, voterEmail: email });
  }

  try {
    const access = await getVoteAccessByToken(token);

    if (!access) {
      return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 404 });
    }

    if (new Date(access.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Ce lien a expiré. Recommencez.' }, { status: 410 });
    }

    // Check not already voted
    const voted = await hasVotedByEmail(access.voterEmail);
    if (voted) {
      return NextResponse.json({ error: 'Tu as déjà voté avec cet email.' }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      voterName: access.voterName,
      voterEmail: access.voterEmail,
    });
  } catch (error) {
    console.error('Validate access error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
