import { NextRequest, NextResponse } from 'next/server';
import { getVotes, getAllCategories, getNominees } from '@/lib/firestore';
import type { Nominee, Category } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId required' }, { status: 400 });
    }

    const [votes, categories] = await Promise.all([
      getVotes(eventId),
      getAllCategories(eventId),
    ]);

    // Build nominees map
    const nomineesMap: Record<string, Nominee> = {};
    const catMap: Record<string, Category> = {};
    for (const cat of categories) {
      catMap[cat.id] = cat;
      const noms = await getNominees(cat.id);
      for (const nom of noms) {
        nomineesMap[nom.id] = nom;
      }
    }

    // Build vote counts per nominee per category
    const counts: Record<string, Record<string, number>> = {};
    for (const vote of votes) {
      for (const answer of vote.answers) {
        if (!counts[answer.categoryId]) counts[answer.categoryId] = {};
        counts[answer.categoryId][answer.nomineeId] =
          (counts[answer.categoryId][answer.nomineeId] || 0) + 1;
      }
    }

    // Build CSV
    const rows: string[] = [];

    // Summary section
    rows.push('=== RÉSULTATS ANIME AWARDS 2026 ===');
    rows.push(`Total votes: ${votes.length}`);
    rows.push('');

    // Results by category
    rows.push('=== RÉSULTATS PAR CATÉGORIE ===');
    rows.push('Catégorie,Nominé,Anime,Votes');

    for (const cat of categories) {
      const catVotes = counts[cat.id] || {};
      const sortedNominees = Object.entries(catVotes).sort(([, a], [, b]) => b - a);

      for (const [nomineeId, count] of sortedNominees) {
        const nominee = nomineesMap[nomineeId];
        rows.push(
          `"${cat.titleFr}","${nominee?.name || nomineeId}","${nominee?.anime || ''}",${count}`
        );
      }
    }

    rows.push('');
    rows.push('=== VOTES INDIVIDUELS ===');
    rows.push('Votant,Email,Pays,Date,Catégorie,Choix');

    for (const vote of votes) {
      for (const answer of vote.answers) {
        const cat = catMap[answer.categoryId];
        const nominee = nomineesMap[answer.nomineeId];
        rows.push(
          `"${vote.voterName}","${vote.voterEmail || ''}","${vote.voterCountry || ''}","${vote.votedAt}","${cat?.titleFr || answer.categoryId}","${nominee?.name || answer.nomineeId}"`
        );
      }
    }

    const csv = '\uFEFF' + rows.join('\n'); // BOM for Excel UTF-8

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="anime-awards-2026-results.csv"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
