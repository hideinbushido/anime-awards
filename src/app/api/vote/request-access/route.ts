import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createVoteAccess, hasVotedByEmail } from '@/lib/firestore';
import { sendAccessEmail } from '@/lib/email';
import { db } from '@/lib/firebase';

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const { voterName, voterEmail, locale } = await req.json();

    if (!voterName?.trim() || !voterEmail?.trim()) {
      return NextResponse.json({ error: 'Nom et email requis.' }, { status: 400 });
    }

    const email = voterEmail.trim().toLowerCase();
    const safeLocale = ['fr', 'en'].includes(locale) ? locale : 'fr';

    // No Firebase → dev mode, return direct access URL
    if (!db) {
      const token = randomUUID();
      const accessUrl = `${getBaseUrl(req)}/${safeLocale}/vote/access?token=${token}&name=${encodeURIComponent(voterName.trim())}&email=${encodeURIComponent(email)}&dev=1`;
      return NextResponse.json({ success: true, mode: 'dev', accessUrl });
    }

    // Check already voted
    const alreadyVoted = await hasVotedByEmail(email);
    if (alreadyVoted) {
      return NextResponse.json(
        { error: 'Cette adresse email a déjà été utilisée pour voter.' },
        { status: 429 }
      );
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await createVoteAccess({
      token,
      voterName: voterName.trim(),
      voterEmail: email,
      expiresAt,
    });

    const accessUrl = `${getBaseUrl(req)}/${safeLocale}/vote/access?token=${token}`;
    const sent = await sendAccessEmail(email, voterName.trim(), accessUrl);

    if (!sent) {
      // Gmail not configured — return direct URL (dev fallback)
      return NextResponse.json({ success: true, mode: 'no_email', accessUrl });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Request access error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
