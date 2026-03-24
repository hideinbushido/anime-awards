import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'crypto';
import { savePendingVote, hasVoted, hasVotedByEmail } from '@/lib/firestore';
import { db } from '@/lib/firebase';

function getIpHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return createHash('sha256').update(ip).digest('hex');
}

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

async function sendConfirmationEmail(
  to: string,
  voterName: string,
  confirmUrl: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const html = `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#080600;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:linear-gradient(135deg,#c9a227,#9e7c1e);border-radius:16px;margin-bottom:16px;">
        <span style="font-size:28px;">🏆</span>
      </div>
      <h1 style="margin:0;color:#c9a227;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Anime Awards 2026</h1>
    </div>

    <div style="background:#111108;border:1px solid rgba(201,162,39,0.25);border-radius:20px;padding:32px;">
      <h2 style="margin:0 0 12px;color:#f0e8d0;font-size:20px;font-weight:900;">
        Confirme ton vote, ${voterName}&nbsp;!
      </h2>
      <p style="margin:0 0 24px;color:#9a8870;font-size:15px;line-height:1.6;">
        Tu as presque terminé ! Clique sur le bouton ci-dessous pour valider définitivement tes votes pour les Anime Awards 2026.
      </p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${confirmUrl}"
          style="display:inline-block;background:linear-gradient(135deg,#c9a227,#9e7c1e);color:#000;text-decoration:none;font-weight:900;font-size:16px;padding:16px 40px;border-radius:14px;letter-spacing:0.3px;">
          Confirmer mes votes ✓
        </a>
      </div>

      <p style="margin:24px 0 0;color:#4a3a2a;font-size:12px;text-align:center;line-height:1.5;">
        Ce lien est valide pendant <strong style="color:#665544;">24 heures</strong>.<br>
        Si tu n'as pas participé au vote, ignore cet email.
      </p>
    </div>

    <p style="text-align:center;color:#3a2e1e;font-size:11px;margin-top:24px;">
      Anime Awards 2026 — La communauté anime
    </p>
  </div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Anime Awards <onboarding@resend.dev>',
        to: [to],
        subject: `${voterName}, confirme ton vote — Anime Awards 2026`,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, voterName, voterTiktok, voterEmail, answers, locale } = body;

    if (!eventId || !voterName?.trim() || !voterEmail?.trim()) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Aucun vote fourni.' }, { status: 400 });
    }

    const email = voterEmail.trim().toLowerCase();

    // No Firebase → skip validation (dev/placeholder mode)
    if (!db) {
      return NextResponse.json({ success: true, mode: 'dev' });
    }

    // Check email already voted
    const emailVoted = await hasVotedByEmail(email);
    if (emailVoted) {
      return NextResponse.json(
        { error: 'Cette adresse email a déjà été utilisée pour voter.' },
        { status: 429 }
      );
    }

    // Check IP
    const ipHash = getIpHash(req);
    const ipVoted = await hasVoted(eventId, ipHash);
    if (ipVoted) {
      return NextResponse.json(
        { error: 'Un vote a déjà été soumis depuis cette connexion.' },
        { status: 429 }
      );
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const safeLocale = ['fr', 'en'].includes(locale) ? locale : 'fr';

    await savePendingVote({
      token,
      eventId,
      voterName: voterName.trim(),
      voterTiktok: voterTiktok?.trim() || undefined,
      voterEmail: email,
      locale: safeLocale,
      answers,
      ipHash,
      expiresAt,
    });

    const confirmUrl = `${getBaseUrl(req)}/${safeLocale}/vote/confirm?token=${token}`;
    const sent = await sendConfirmationEmail(email, voterName.trim(), confirmUrl);

    if (!sent) {
      // No Resend key → save vote directly (dev mode)
      return NextResponse.json({ success: true, mode: 'no_email', confirmUrl });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pending vote error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
