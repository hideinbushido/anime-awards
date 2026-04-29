import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: 'Firebase non configuré.' }, { status: 500 });

  const { secret } = await req.json();
  if (secret !== 'zenkai-reminder-2026') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  if (!user || !pass) return NextResponse.json({ error: 'Gmail non configuré.' }, { status: 500 });

  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });

  // Fetch only voters who haven't received the reminder yet
  const snap = await getDocs(collection(db, 'votes'));
  const voters: { id: string; name: string; email: string }[] = [];
  snap.docs.forEach(d => {
    const data = d.data();
    if (data.voterEmail && !data.reminderSent) {
      voters.push({ id: d.id, name: data.voterName || 'Votant', email: data.voterEmail });
    }
  });

  let sent = 0;
  let failed = 0;

  for (const voter of voters) {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080600;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:28px;">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:linear-gradient(135deg,#c9a227,#9e7c1e);border-radius:16px;margin-bottom:14px;">
      <span style="font-size:28px;">🏆</span>
    </div>
    <h1 style="margin:0;color:#c9a227;font-size:22px;font-weight:900;">Anime Awards 2026</h1>
    <p style="margin:4px 0 0;color:#665544;font-size:13px;">La communauté anime</p>
  </div>

  <div style="background:#111108;border:1px solid rgba(201,162,39,0.25);border-radius:20px;padding:32px;">
    <h2 style="margin:0 0 12px;color:#f0e8d0;font-size:20px;font-weight:900;line-height:1.3;">
      Le Live approche, <span style="color:#c9a227;">${voter.name}</span>&nbsp;! 🎉
    </h2>
    <p style="margin:0 0 20px;color:#9a8870;font-size:14px;line-height:1.7;">
      Merci d'avoir voté aux <strong style="color:#f0e8d0;">Zenkai Anime Awards 2026</strong> !<br>
      Les résultats seront révélés en direct le <strong style="color:#c9a227;">2 mai 2026</strong>.
    </p>

    <div style="background:rgba(201,162,39,0.06);border:1px solid rgba(201,162,39,0.2);border-radius:14px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;color:#c9a227;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📅 Infos du Live</p>
      <p style="margin:0 0 6px;color:#f0e8d0;font-size:15px;font-weight:900;">2 Mai 2026</p>
      <p style="margin:0 0 4px;color:#9a8870;font-size:13px;">🇨🇦 14h00 — Canada (GMT-4)</p>
      <p style="margin:0 0 4px;color:#9a8870;font-size:13px;">🌍 18h00 — GMT+0</p>
      <p style="margin:0;color:#9a8870;font-size:13px;">🇫🇷 20h00 — France (GMT+2)</p>
    </div>

    <div style="text-align:center;">
      <a href="https://www.tiktok.com/@ricokouame"
        style="display:inline-block;background:linear-gradient(135deg,#c9a227,#9e7c1e);color:#000;text-decoration:none;font-weight:900;font-size:15px;padding:16px 40px;border-radius:14px;">
        Regarder le Live sur TikTok →
      </a>
    </div>
  </div>

  <p style="text-align:center;color:#2a1e0a;font-size:11px;margin-top:20px;">
    Zenkai Anime Awards 2026 — Les récompenses de la communauté anime
  </p>
</div>
</body>
</html>`;

    try {
      await transport.sendMail({
        from: `"Anime Awards 2026" <${user}>`,
        to: voter.email,
        subject: `📅 Le Live c'est le 2 Mai — Zenkai Anime Awards 2026`,
        html,
      });
      await updateDoc(doc(db, 'votes', voter.id), { reminderSent: true });
      sent++;
    } catch {
      failed++;
    }

    // Small delay to avoid Gmail rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  return NextResponse.json({ sent, failed, total: voters.length });
}
