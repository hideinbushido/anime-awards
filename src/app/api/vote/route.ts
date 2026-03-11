import { NextRequest, NextResponse } from 'next/server';
import { submitVote, hasVoted, getActiveEvent } from '@/lib/firestore';
import { createHash } from 'crypto';

function getIpHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return createHash('sha256').update(ip).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, voterName, voterEmail, voterCountry, answers } = body;

    // Validation
    if (!eventId || !voterName?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    // Verify the event exists and voting is open
    const event = await getActiveEvent();
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status !== 'voting_open') {
      return NextResponse.json({ error: 'Voting is not open' }, { status: 403 });
    }

    // Anti-spam: check IP hash
    const ipHash = getIpHash(req);
    const alreadyVoted = await hasVoted(eventId, ipHash);
    if (alreadyVoted) {
      return NextResponse.json(
        { error: 'You have already voted from this IP address' },
        { status: 429 }
      );
    }

    // Validate answers format
    for (const answer of answers) {
      if (!answer.categoryId || !answer.nomineeId) {
        return NextResponse.json({ error: 'Invalid answer format' }, { status: 400 });
      }
    }

    // Submit vote
    const voteId = await submitVote({
      eventId,
      voterName: voterName.trim(),
      voterEmail: voterEmail?.trim() || undefined,
      voterCountry: voterCountry?.trim() || undefined,
      answers,
      ipHash,
    });

    return NextResponse.json({ success: true, voteId });
  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
