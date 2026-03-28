'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, getDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PLACEHOLDER_CATEGORIES, PLACEHOLDER_NOMINEES } from '@/app/[locale]/nominees/page';
import {
  Trophy, Users, Vote, RefreshCw, ChevronDown, ChevronUp, Download, Eye,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Voter {
  name: string;
  tiktok?: string;
  votedAt: string;
}

interface NomineeResult {
  nomineeId: string;
  nomineeName: string;
  count: number;
  voters: Voter[];
}

interface CategoryResult {
  categoryId: string;
  categoryTitle: string;
  nominees: NomineeResult[];
  totalVotes: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildNameMaps() {
  const catMap: Record<string, string> = {};
  const nomMap: Record<string, string> = {};
  for (const cat of PLACEHOLDER_CATEGORIES) catMap[cat.id] = cat.title;
  for (const nominees of Object.values(PLACEHOLDER_NOMINEES))
    for (const nom of nominees) nomMap[nom.id] = nom.name;
  return { catMap, nomMap };
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardClient() {
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [totalVisits, setTotalVisits] = useState<number | null>(null);
  const [todayVisits, setTodayVisits] = useState<number | null>(null);
  const [visitStats, setVisitStats] = useState<{ countries: [string,number][]; sources: [string,number][]; devices: [string,number][] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [expandedNoms, setExpandedNoms] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!db) { setError('Firebase non configuré.'); return; }
    setLoading(true);
    setError('');
    try {
      // Fetch visit stats
      const statsSnap = await getDoc(doc(db, 'stats', 'pageViews'));
      if (statsSnap.exists()) {
        const d = statsSnap.data();
        setTotalVisits(d.total ?? 0);
        const today = new Date().toISOString().slice(0, 10);
        setTodayVisits(d[today] ?? 0);

        const pick = (prefix: string) =>
          Object.entries(d)
            .filter(([k]) => k.startsWith(prefix))
            .map(([k, v]) => [k.slice(prefix.length), v as number] as [string, number])
            .sort((a, b) => b[1] - a[1]);

        setVisitStats({
          countries: pick('c_'),
          sources: pick('s_'),
          devices: pick('d_'),
        });
      } else {
        setTotalVisits(0);
        setTodayVisits(0);
        setVisitStats({ countries: [], sources: [], devices: [] });
      }

      const snap = await getDocs(collection(db, 'votes'));
      const votes = snap.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          votedAt: data.votedAt instanceof Timestamp
            ? data.votedAt.toDate().toISOString()
            : (data.votedAt ?? ''),
        };
      });

      const { catMap, nomMap } = buildNameMaps();
      const counts: Record<string, Record<string, { count: number; voters: Voter[] }>> = {};

      for (const vote of votes) {
        const voter: Voter = {
          name: (vote as any).voterName ?? 'Anonyme',
          tiktok: (vote as any).voterTiktok,
          votedAt: (vote as any).votedAt ?? '',
        };
        for (const answer of ((vote as any).answers ?? [])) {
          if (!counts[answer.categoryId]) counts[answer.categoryId] = {};
          if (!counts[answer.categoryId][answer.nomineeId])
            counts[answer.categoryId][answer.nomineeId] = { count: 0, voters: [] };
          counts[answer.categoryId][answer.nomineeId].count++;
          counts[answer.categoryId][answer.nomineeId].voters.push(voter);
        }
      }

      const catOrder: Record<string, number> = {};
      PLACEHOLDER_CATEGORIES.forEach((c, i) => { catOrder[c.id] = i; });

      const categoryResults: CategoryResult[] = Object.entries(counts)
        .map(([catId, nomCounts]) => ({
          categoryId: catId,
          categoryTitle: catMap[catId] ?? catId,
          nominees: Object.entries(nomCounts)
            .map(([nomId, d]) => ({
              nomineeId: nomId,
              nomineeName: nomMap[nomId] ?? nomId,
              count: d.count,
              voters: d.voters.sort((a, b) => b.votedAt.localeCompare(a.votedAt)),
            }))
            .sort((a, b) => b.count - a.count),
          totalVotes: Object.values(nomCounts).reduce((s, d) => s + d.count, 0),
        }))
        .sort((a, b) => (catOrder[a.categoryId] ?? 99) - (catOrder[b.categoryId] ?? 99));

      setResults(categoryResults);
      setTotalVotes(votes.length);
      setTotalAnswers(categoryResults.reduce((s, c) => s + c.totalVotes, 0));
      setLastUpdated(new Date());

      // Auto-expand all categories on first load
      setExpandedCats(prev => {
        const next = { ...prev };
        categoryResults.forEach(c => { if (!(c.categoryId in next)) next[c.categoryId] = true; });
        return next;
      });
    } catch (e: any) {
      setError(e.message ?? 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleExportCSV = () => {
    const rows = ['Catégorie,Rang,Nominé,Votes,%,Votant,TikTok,Date'];
    for (const cat of results) {
      cat.nominees.forEach((nom, i) => {
        const pct = cat.totalVotes > 0 ? ((nom.count / cat.totalVotes) * 100).toFixed(1) : '0.0';
        if (!nom.voters.length) {
          rows.push(`"${cat.categoryTitle}",${i + 1},"${nom.nomineeName}",${nom.count},${pct}%,,,`);
        } else {
          nom.voters.forEach((v, vi) =>
            rows.push(vi === 0
              ? `"${cat.categoryTitle}",${i + 1},"${nom.nomineeName}",${nom.count},${pct}%,"${v.name}","${v.tiktok ?? ''}","${v.votedAt}"`
              : `,,,,,"${v.name}","${v.tiktok ?? ''}","${v.votedAt}"`
            )
          );
        }
      });
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'anime-awards-votes-detail.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">
            Recensement des <span style={{ color: '#c9a227' }}>votes</span>
          </h1>
          {lastUpdated && (
            <p className="text-xs mt-1" style={{ color: '#4a3a2a' }}>
              Actualisé à {fmtDate(lastUpdated.toISOString())}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Stat pills */}
          {totalVisits !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}
              title={`Aujourd'hui : ${todayVisits ?? 0} visite${(todayVisits ?? 0) !== 1 ? 's' : ''}`}>
              <Eye className="w-3.5 h-3.5" />
              {totalVisits} visite{totalVisits !== 1 ? 's' : ''}
              {todayVisits !== null && todayVisits > 0 && (
                <span style={{ opacity: 0.7 }}>(+{todayVisits} auj.)</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(201,162,39,0.1)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.2)' }}>
            <Vote className="w-3.5 h-3.5" />
            {totalVotes} votant{totalVotes !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Users className="w-3.5 h-3.5" />
            {totalAnswers} réponses
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9a8870', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Chargement…' : 'Actualiser'}
          </button>
          <button onClick={handleExportCSV} disabled={results.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'rgba(201,162,39,0.12)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.25)' }}>
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Visit breakdown */}
      {visitStats && (visitStats.countries.length > 0 || visitStats.sources.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Sources */}
          <div className="rounded-2xl p-4" style={{ background: '#0f0d09', border: '1px solid rgba(34,197,94,0.12)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ade80' }}>Source</p>
            <div className="space-y-1.5">
              {visitStats.sources.map(([src, count]) => (
                <div key={src} className="flex items-center justify-between text-xs">
                  <span style={{ color: '#9a8870' }} className="capitalize">{src === 'direct' ? '🔗 Direct' : src === 'tiktok' ? '🎵 TikTok' : src === 'instagram' ? '📷 Instagram' : src === 'facebook' ? '👥 Facebook' : src === 'twitter' ? '🐦 Twitter' : src === 'youtube' ? '▶️ YouTube' : `🌐 ${src}`}</span>
                  <span className="font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pays */}
          <div className="rounded-2xl p-4" style={{ background: '#0f0d09', border: '1px solid rgba(34,197,94,0.12)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ade80' }}>Pays</p>
            <div className="space-y-1.5">
              {visitStats.countries.slice(0, 8).map(([country, count]) => (
                <div key={country} className="flex items-center justify-between text-xs">
                  <span style={{ color: '#9a8870' }}>{country === 'unknown' ? '❓ Inconnu' : `${country}`}</span>
                  <span className="font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Appareils */}
          <div className="rounded-2xl p-4" style={{ background: '#0f0d09', border: '1px solid rgba(34,197,94,0.12)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ade80' }}>Appareil</p>
            <div className="space-y-1.5">
              {visitStats.devices.map(([device, count]) => (
                <div key={device} className="flex items-center justify-between text-xs">
                  <span style={{ color: '#9a8870' }}>{device === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}</span>
                  <span className="font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm mb-4"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && results.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl h-16 animate-pulse"
              style={{ background: '#0f0d09', border: '1px solid rgba(201,162,39,0.08)' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && !error && (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: '#0f0d09', border: '1px solid rgba(201,162,39,0.1)' }}>
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: '#c9a227' }} />
          <p className="text-white font-bold mb-1">Aucun vote pour l'instant</p>
          <p className="text-sm" style={{ color: '#4a3a2a' }}>
            Les résultats apparaîtront ici dès que des votes seront soumis.
          </p>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {results.map((cat) => {
          const maxVotes = cat.nominees[0]?.count ?? 1;
          const isExpanded = expandedCats[cat.categoryId] ?? false;

          return (
            <div key={cat.categoryId} className="rounded-2xl overflow-hidden"
              style={{ background: '#0f0d09', border: '1px solid rgba(201,162,39,0.12)' }}>

              {/* Category header — clickable */}
              <button onClick={() => setExpandedCats(p => ({ ...p, [cat.categoryId]: !p[cat.categoryId] }))}
                className="w-full flex items-center justify-between px-5 py-4 transition-all hover:brightness-110 text-left"
                style={{ background: 'rgba(201,162,39,0.03)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-black text-white truncate">{cat.categoryTitle}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold flex-shrink-0"
                    style={{ background: 'rgba(201,162,39,0.15)', color: '#c9a227' }}>
                    {cat.totalVotes} vote{cat.totalVotes !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-xs hidden sm:block" style={{ color: '#3a2e1e' }}>
                    {cat.nominees.length} nominé{cat.nominees.length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4" style={{ color: '#665544' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: '#665544' }} />}
                </div>
              </button>

              {/* Nominees */}
              {isExpanded && (
                <div>
                  {cat.nominees.map((nom, i) => {
                    const pct = cat.totalVotes > 0 ? (nom.count / cat.totalVotes) * 100 : 0;
                    const nomKey = `${cat.categoryId}__${nom.nomineeId}`;
                    const votersOpen = expandedNoms[nomKey] ?? false;
                    const isLeader = i === 0;

                    return (
                      <div key={nom.nomineeId}
                        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        {/* Nominee row */}
                        <div className="flex items-center gap-3 px-5 py-3">
                          {/* Rank badge */}
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                            style={{
                              background: isLeader ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)',
                              color: isLeader ? '#c9a227' : '#3a2e1e',
                            }}>
                            {i + 1}
                          </div>

                          {/* Name + bar */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <span className={`text-sm font-bold truncate ${isLeader ? 'text-white' : 'text-[#c5baa0]'}`}>
                                {nom.nomineeName}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs" style={{ color: '#4a3a2a' }}>
                                  {pct.toFixed(1)}%
                                </span>
                                <span className="text-sm font-black w-6 text-right"
                                  style={{ color: isLeader ? '#c9a227' : '#665544' }}>
                                  {nom.count}
                                </span>
                              </div>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${(nom.count / maxVotes) * 100}%`,
                                  background: isLeader
                                    ? 'linear-gradient(90deg, #c9a227, #e8c54a)'
                                    : 'rgba(201,162,39,0.3)',
                                }} />
                            </div>
                          </div>

                          {/* Voters toggle button */}
                          {nom.voters.length > 0 && (
                            <button
                              onClick={() => setExpandedNoms(p => ({ ...p, [nomKey]: !p[nomKey] }))}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all hover:brightness-110"
                              style={{
                                background: votersOpen ? 'rgba(201,162,39,0.1)' : 'rgba(255,255,255,0.04)',
                                color: votersOpen ? '#c9a227' : '#665544',
                                border: votersOpen
                                  ? '1px solid rgba(201,162,39,0.2)'
                                  : '1px solid rgba(255,255,255,0.06)',
                              }}>
                              <Users className="w-3 h-3" />
                              {nom.voters.length}
                              {votersOpen
                                ? <ChevronUp className="w-3 h-3" />
                                : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>

                        {/* Voters table */}
                        {votersOpen && nom.voters.length > 0 && (
                          <div className="px-5 pb-3">
                            <div className="rounded-xl overflow-hidden text-xs"
                              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              {/* Table header */}
                              <div className="grid grid-cols-[1fr_1fr_auto] px-4 py-2 font-semibold uppercase tracking-wider"
                                style={{ color: '#4a3a2a', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '8px' }}>
                                <span>Nom</span>
                                <span>TikTok</span>
                                <span>Date</span>
                              </div>
                              {/* Rows */}
                              {nom.voters.map((v, vi) => (
                                <div key={vi}
                                  className="grid grid-cols-[1fr_1fr_auto] px-4 py-2 items-center"
                                  style={{
                                    gap: '8px',
                                    borderBottom: vi < nom.voters.length - 1
                                      ? '1px solid rgba(255,255,255,0.03)'
                                      : 'none',
                                  }}>
                                  <span className="font-medium text-white truncate">{v.name}</span>
                                  <span style={{ color: '#9a8870' }} className="truncate">
                                    {v.tiktok ? `@${v.tiktok.replace(/^@/, '')}` : '—'}
                                  </span>
                                  <span style={{ color: '#4a3a2a' }} className="whitespace-nowrap">
                                    {fmtDate(v.votedAt)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
