import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'crypto';
import { savePendingVote, hasVoted, hasVotedByEmail } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { PLACEHOLDER_CATEGORIES, PLACEHOLDER_NOMINEES } from '@/app/[locale]/nominees/page';
import type { VoteAnswer } from '@/lib/types';

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

// Resolve category title and nominee name from IDs
function resolveVotes(answers: VoteAnswer[]) {
  return PLACEHOLDER_CATEGORIES
    .filter(cat => answers.some(a => a.categoryId === cat.id))
    .map(cat => {
      const answer = answers.find(a => a.categoryId === cat.id)!;
      const nominees = PLACEHOLDER_NOMINEES[cat.id] ?? [];
      const nominee = nominees.find(n => n.id === answer.nomineeId);
      return {
        category: cat.titleFr,
        nominee: nominee?.name ?? answer.nomineeId,
      };
    });
}

function buildRecapRows(answers: VoteAnswer[]): string {
  const resolved = resolveVotes(answers);
  return resolved.map((row, i) => `
    <tr style="background:${i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};">
      <td style="padding:10px 16px;color:#9a8870;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04);">${row.category}</td>
      <td style="padding:10px 16px;color:#f0e8d0;font-size:13px;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;">${row.nominee}</td>
    </tr>`).join('');
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Anime Awards <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendConfirmationEmail(
  to: string,
  voterName: string,
  confirmUrl: string,
  answers: VoteAnswer[]
): Promise<boolean> {
  const recapRows = buildRecapRows(answers);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080600;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:linear-gradient(135deg,#c9a227,#9e7c1e);border-radius:16px;margin-bottom:14px;">
        <span style="font-size:28px;">🏆</span>
      </div>
      <h1 style="margin:0;color:#c9a227;font-size:22px;font-weight:900;letter-spacing:-0.3px;">Anime Awards 2026</h1>
      <p style="margin:4px 0 0;color:#665544;font-size:13px;">La communauté anime</p>
    </div>

    <!-- Main card -->
    <div style="background:#111108;border:1px solid rgba(201,162,39,0.25);border-radius:20px;overflow:hidden;">

      <!-- Card header -->
      <div style="padding:28px 28px 0;">
        <h2 style="margin:0 0 10px;color:#f0e8d0;font-size:20px;font-weight:900;line-height:1.2;">
          Confirme tes votes, <span style="color:#c9a227;">${voterName}</span>&nbsp;!
        </h2>
        <p style="margin:0;color:#9a8870;font-size:14px;line-height:1.6;">
          Voici le récapitulatif de tes votes. Clique sur le bouton ci-dessous pour les valider définitivement.
        </p>
      </div>

      <!-- Recap table -->
      <div style="margin:24px 0 0;">
        <div style="padding:0 28px 10px;">
          <p style="margin:0;color:#c9a227;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
            Récapitulatif de tes votes
          </p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:rgba(201,162,39,0.06);">
              <th style="padding:10px 16px;text-align:left;color:#665544;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Catégorie</th>
              <th style="padding:10px 16px;text-align:right;color:#665544;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Ton vote</th>
            </tr>
          </thead>
          <tbody>${recapRows}</tbody>
        </table>
      </div>

      <!-- CTA -->
      <div style="padding:28px;text-align:center;">
        <a href="${confirmUrl}"
          style="display:inline-block;background:linear-gradient(135deg,#c9a227,#9e7c1e);color:#000;text-decoration:none;font-weight:900;font-size:16px;padding:16px 48px;border-radius:14px;letter-spacing:0.3px;">
          ✓ Confirmer mes votes
        </a>
        <p style="margin:20px 0 0;color:#4a3a2a;font-size:12px;line-height:1.6;">
          Ce lien est valide pendant <strong style="color:#665544;">24 heures</strong>.<br>
          Si tu n'as pas participé au vote, ignore cet email.
        </p>
      </div>
    </div>

    <p style="text-align:center;color:#2a1e0a;font-size:11px;margin-top:20px;">
      Anime Awards 2026 — Les récompenses de la communauté anime
    </p>
  </div>
</body>
</html>`;

  return sendEmail(to, `${voterName}, confirme tes votes — Anime Awards 2026`, html);
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

    // No Firebase → skip (dev/placeholder mode)
    if (!db) {
      return NextResponse.json({ success: true, mode: 'dev' });
    }

    const emailVoted = await hasVotedByEmail(email);
    if (emailVoted) {
      return NextResponse.json(
        { error: 'Cette adresse email a déjà été utilisée pour voter.' },
        { status: 429 }
      );
    }

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
    const sent = await sendConfirmationEmail(email, voterName.trim(), confirmUrl, answers);

    if (!sent) {
      // No Resend key — redirect directly to confirm URL (dev mode)
      return NextResponse.json({ success: true, mode: 'no_email', confirmUrl });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pending vote error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
