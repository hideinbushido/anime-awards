import { NextResponse } from 'next/server';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST() {
  if (!db) return NextResponse.json({ ok: true });

  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    await setDoc(
      doc(db, 'stats', 'pageViews'),
      { total: increment(1), [today]: increment(1) },
      { merge: true }
    );
  } catch {
    // fail silently — visit tracking is non-critical
  }

  return NextResponse.json({ ok: true });
}
