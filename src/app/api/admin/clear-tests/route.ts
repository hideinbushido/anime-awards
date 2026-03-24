import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== 'clear-anime-awards-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
  }

  const results: Record<string, number> = {};

  for (const col of ['votes', 'voteAccess', 'pendingVotes']) {
    const snap = await getDocs(collection(db, col));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    results[col] = snap.size;
  }

  return NextResponse.json({ success: true, deleted: results });
}
