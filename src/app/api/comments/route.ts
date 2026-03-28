import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  if (!db) return NextResponse.json({ comments: [] });

  try {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const comments = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? 'Anonyme',
        text: data.text ?? '',
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : (data.createdAt ?? ''),
      };
    });
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: 'Non disponible.' }, { status: 503 });

  try {
    const { name, text } = await req.json();

    if (!name?.trim() || !text?.trim())
      return NextResponse.json({ error: 'Nom et message requis.' }, { status: 400 });
    if (name.trim().length > 50)
      return NextResponse.json({ error: 'Nom trop long (50 caractères max).' }, { status: 400 });
    if (text.trim().length > 500)
      return NextResponse.json({ error: 'Message trop long (500 caractères max).' }, { status: 400 });
    if (text.trim().length < 5)
      return NextResponse.json({ error: 'Message trop court.' }, { status: 400 });

    const ref = await addDoc(collection(db, 'comments'), {
      name: name.trim(),
      text: text.trim(),
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: ref.id });
  } catch {
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
