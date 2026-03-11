import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AnimeEvent, Category, Nominee, Vote, VoteAnswer } from './types';

function getDb() {
  if (!db) throw new Error('Firebase not configured. Please set environment variables.');
  return db;
}

// ─── Event ────────────────────────────────────────────────────────────────────

export async function getActiveEvent(): Promise<AnimeEvent | null> {
  const firestore = getDb();
  const q = query(
    collection(firestore, 'events'),
    where('status', '!=', 'draft')
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as AnimeEvent;
}

export async function getAllEvents(): Promise<AnimeEvent[]> {
  const firestore = getDb();
  const snap = await getDocs(collection(firestore, 'events'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AnimeEvent));
}

export async function createEvent(data: Omit<AnimeEvent, 'id'>): Promise<string> {
  const firestore = getDb();
  const ref = await addDoc(collection(firestore, 'events'), data);
  return ref.id;
}

export async function updateEvent(id: string, data: Partial<AnimeEvent>): Promise<void> {
  const firestore = getDb();
  await updateDoc(doc(firestore, 'events', id), data as Record<string, unknown>);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(eventId: string): Promise<Category[]> {
  const firestore = getDb();
  const q = query(
    collection(firestore, 'categories'),
    where('eventId', '==', eventId),
    where('active', '==', true),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function getAllCategories(eventId: string): Promise<Category[]> {
  const firestore = getDb();
  const q = query(
    collection(firestore, 'categories'),
    where('eventId', '==', eventId),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<string> {
  const firestore = getDb();
  const ref = await addDoc(collection(firestore, 'categories'), data);
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  const firestore = getDb();
  await updateDoc(doc(firestore, 'categories', id), data as Record<string, unknown>);
}

export async function deleteCategory(id: string): Promise<void> {
  const firestore = getDb();
  await deleteDoc(doc(firestore, 'categories', id));
}

// ─── Nominees ─────────────────────────────────────────────────────────────────

export async function getNominees(categoryId: string): Promise<Nominee[]> {
  const firestore = getDb();
  const q = query(
    collection(firestore, 'nominees'),
    where('categoryId', '==', categoryId),
    where('active', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Nominee));
}

export async function getAllNominees(eventId?: string): Promise<Nominee[]> {
  const firestore = getDb();
  if (eventId) {
    const cats = await getAllCategories(eventId);
    const catIds = cats.map((c) => c.id);
    if (catIds.length === 0) return [];
    const q = query(
      collection(firestore, 'nominees'),
      where('categoryId', 'in', catIds.slice(0, 10))
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Nominee));
  }
  const snap = await getDocs(collection(firestore, 'nominees'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Nominee));
}

export async function createNominee(data: Omit<Nominee, 'id'>): Promise<string> {
  const firestore = getDb();
  const ref = await addDoc(collection(firestore, 'nominees'), data);
  return ref.id;
}

export async function updateNominee(id: string, data: Partial<Nominee>): Promise<void> {
  const firestore = getDb();
  await updateDoc(doc(firestore, 'nominees', id), data as Record<string, unknown>);
}

export async function deleteNominee(id: string): Promise<void> {
  const firestore = getDb();
  await deleteDoc(doc(firestore, 'nominees', id));
}

// ─── Votes ────────────────────────────────────────────────────────────────────

export async function submitVote(data: {
  eventId: string;
  voterName: string;
  voterEmail?: string;
  voterCountry?: string;
  answers: VoteAnswer[];
  ipHash?: string;
}): Promise<string> {
  const firestore = getDb();
  const ref = await addDoc(collection(firestore, 'votes'), {
    ...data,
    votedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getVotes(eventId: string): Promise<Vote[]> {
  const firestore = getDb();
  const q = query(collection(firestore, 'votes'), where('eventId', '==', eventId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      votedAt:
        data.votedAt instanceof Timestamp
          ? data.votedAt.toDate().toISOString()
          : data.votedAt,
    } as Vote;
  });
}

export async function getVoteCount(eventId: string): Promise<number> {
  const firestore = getDb();
  const q = query(collection(firestore, 'votes'), where('eventId', '==', eventId));
  const snap = await getDocs(q);
  return snap.size;
}

export async function hasVoted(eventId: string, ipHash: string): Promise<boolean> {
  const firestore = getDb();
  const q = query(
    collection(firestore, 'votes'),
    where('eventId', '==', eventId),
    where('ipHash', '==', ipHash)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
