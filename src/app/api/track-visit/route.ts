import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function getSource(referrer: string): string {
  if (!referrer) return 'direct';
  if (referrer.includes('tiktok.com')) return 'tiktok';
  if (referrer.includes('instagram.com')) return 'instagram';
  if (referrer.includes('twitter.com') || referrer.includes('t.co')) return 'twitter';
  if (referrer.includes('youtube.com')) return 'youtube';
  if (referrer.includes('facebook.com') || referrer.includes('fb.')) return 'facebook';
  return 'other';
}

function getDevice(ua: string): string {
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getOS(ua: string): string {
  if (/iphone/i.test(ua)) return 'iphone';
  if (/ipad/i.test(ua)) return 'ipad';
  if (/android/i.test(ua)) return 'android';
  if (/windows/i.test(ua)) return 'windows';
  if (/macintosh|mac os x/i.test(ua)) return 'mac';
  if (/linux/i.test(ua)) return 'linux';
  return 'other';
}

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ ok: true });

  try {
    const body = await req.json().catch(() => ({}));
    const referrer: string = body.referrer ?? '';
    const ua = req.headers.get('user-agent') ?? '';
    const country = (req.headers.get('x-vercel-ip-country') ?? 'unknown').toUpperCase();

    const source = getSource(referrer);
    const device = getDevice(ua);
    const today = new Date().toISOString().slice(0, 10);

    const ref = doc(db, 'stats', 'pageViews');

    // updateDoc fails if doc doesn't exist — use setDoc merge:true as fallback
    const os = getOS(ua);
    const updates = {
      total: increment(1),
      [today]: increment(1),
      [`c_${country}`]: increment(1),   // country — e.g. c_FR
      [`s_${source}`]: increment(1),    // source  — e.g. s_tiktok
      [`d_${device}`]: increment(1),    // device  — e.g. d_mobile
      [`o_${os}`]: increment(1),        // os      — e.g. o_iphone
    };

    try {
      await updateDoc(ref, updates);
    } catch {
      await setDoc(ref, updates, { merge: true });
    }
  } catch {
    // fail silently
  }

  return NextResponse.json({ ok: true });
}
