import { NextRequest, NextResponse } from 'next/server';
import { getPendingVoteByToken, deletePendingVote, submitVote, hasVotedByEmail } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { PLACEHOLDER_CATEGORIES, PLACEHOLDER_NOMINEES } from '@/app/[locale]/nominees/page';
import type { VoteAnswer } from '@/lib/types';

function resolveVotes(answers: VoteAnswer[]) {
  return PLACEHOLDER_CATEGORIES
    .filter(cat => answers.some(a => a.categoryId === cat.id))
    .map(cat => {
      const answer = answers.find(a => a.categoryId === cat.id)!;
      const nominees = PLACEHOLDER_NOMINEES[cat.id] ?? [];
      const nominee = nominees.find(n => n.id === answer.nomineeId);
      return { category: cat.titleFr, nominee: nominee?.name ?? answer.nomineeId };
    });
}

function buildRecapRows(answers: VoteAnswer[]): string {
  return resolveVotes(answers).map((row, i) => `
    <tr style="background:${i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};">
      <td style="padding:10px 16px;color:#9a8870;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04);">${row.category}</td>
      <td style="padding:10px 16px;color:#f0e8d0;font-size:13px;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;">${row.nominee}</td>
    </tr>`).join('');
}

async function sendConfirmedEmail(
  to: string,
  voterName: string,
  answers: VoteAnswer[]
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const recapRows = buildRecapRows(answers);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080600;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:linear-gradient(135deg,#c9a227,#9e7c1e);border-radius:16px;margin-bottom:14px;">
        <span style="font-size:28px;">✅</span>
      </div>
      <h1 style="margin:0;color:#c9a227;font-size:22px;font-weight:900;">Anime Awards 2026</h1>
      <p style="margin:4px 0 0;color:#665544;font-size:13px;">La communauté anime</p>
    </div>

    <!-- Main card -->
    <div style="background:#111108;border:1px solid rgba(201,162,39,0.25);border-radius:20px;overflow:hidden;">

      <!-- Card header -->
      <div style="padding:28px 28px 0;">
        <h2 style="margin:0 0 10px;color:#f0e8d0;font-size:20px;font-weight:900;line-height:1.2;">
          Votes confirmés, <span style="color:#c9a227;">${voterName}</span>&nbsp;! 🎉
        </h2>
        <p style="margin:0;color:#9a8870;font-size:14px;line-height:1.6;">
          Tes votes ont bien été enregistrés pour les Anime Awards 2026. Voici ton récapitulatif officiel.
        </p>
      </div>

      <!-- Recap table -->
      <div style="margin:24px 0 0;">
        <div style="padding:0 28px 10px;">
          <p style="margin:0;color:#c9a227;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
            Récapitulatif officiel de tes votes
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

      <!-- Footer of card -->
      <div style="padding:24px 28px;">
        <p style="margin:0;color:#665544;font-size:13px;line-height:1.6;">
          Les résultats seront annoncés en direct sur TikTok. Reste connecté&nbsp;!
        </p>
      </div>
    </div>

    <p style="text-align:center;color:#2a1e0a;font-size:11px;margin-top:20px;">
      Anime Awards 2026 — Les récompenses de la communauté anime
    </p>
  </div>
</body>
</html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Anime Awards <onboarding@resend.dev>',
        to: [to],
        subject: `✅ Votes confirmés — Anime Awards 2026`,
        html,
      }),
    });
  } catch {
    // Non-blocking — confirmation already saved
  }
}

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

    if (new Date(pending.expiresAt) < new Date()) {
      await deletePendingVote(pending.docId);
      return NextResponse.json({ error: 'Ce lien a expiré. Recommencez le vote.' }, { status: 410 });
    }

    const alreadyVoted = await hasVotedByEmail(pending.voterEmail);
    if (alreadyVoted) {
      await deletePendingVote(pending.docId);
      return NextResponse.json({ error: 'Ce vote a déjà été confirmé.' }, { status: 409 });
    }

    const voteId = await submitVote({
      eventId: pending.eventId,
      voterName: pending.voterName,
      voterTiktok: pending.voterTiktok,
      voterEmail: pending.voterEmail,
      answers: pending.answers,
      ipHash: pending.ipHash,
    });

    await deletePendingVote(pending.docId);

    // Send recap email (non-blocking)
    sendConfirmedEmail(pending.voterEmail, pending.voterName, pending.answers);

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
