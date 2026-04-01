import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: 'Firebase non configuré.' }, { status: 500 });

  const { voterName, secret } = await req.json();
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const deleted: string[] = [];

  // Delete from votes
  const votesQ = query(collection(db, 'votes'), where('voterName', '==', voterName));
  const votesSnap = await getDocs(votesQ);
  for (const d of votesSnap.docs) { await deleteDoc(d.ref); deleted.push(`vote:${d.id}`); }

  // Delete from voteAccess (unblocks the email)
  const accessQ = query(collection(db, 'voteAccess'), where('voterName', '==', voterName));
  const accessSnap = await getDocs(accessQ);
  for (const d of accessSnap.docs) { await deleteDoc(d.ref); deleted.push(`access:${d.id}`); }

  // Delete from pendingVotes
  const pendingQ = query(collection(db, 'pendingVotes'), where('voterName', '==', voterName));
  const pendingSnap = await getDocs(pendingQ);
  for (const d of pendingSnap.docs) { await deleteDoc(d.ref); deleted.push(`pending:${d.id}`); }

  return NextResponse.json({ deleted });
}
