'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LogOut, BarChart2, ChevronDown, ChevronUp, Trophy, X } from 'lucide-react';
import { useLocale } from 'next-intl';

interface CategoryCount {
  categoryId: string;
  categoryTitle: string;
  nominees: { name: string; count: number }[];
}

export default function AdminFloatingPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<CategoryCount[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      if (!user) { setOpen(false); setStats([]); }
    });
    return unsub;
  }, []);

  const loadStats = async () => {
    if (!db || loadingStats) return;
    setLoadingStats(true);
    try {
      // Get all votes
      const snap = await getDocs(collection(db, 'votes'));
      const votes = snap.docs.map(d => d.data());

      // Count per nominee per category
      const counts: Record<string, Record<string, number>> = {};
      for (const vote of votes) {
        for (const answer of (vote.answers ?? [])) {
          if (!counts[answer.categoryId]) counts[answer.categoryId] = {};
          counts[answer.categoryId][answer.nomineeId] = (counts[answer.categoryId][answer.nomineeId] ?? 0) + 1;
        }
      }

      // Get nominee names from nominees collection
      const result: CategoryCount[] = [];
      for (const [catId, nomCounts] of Object.entries(counts)) {
        const nomSnap = await getDocs(query(collection(db, 'nominees'), where('categoryId', '==', catId)));
        const nomMap: Record<string, string> = {};
        nomSnap.docs.forEach(d => { nomMap[d.id] = d.data().name; });

        const nominees = Object.entries(nomCounts)
          .map(([id, count]) => ({ name: nomMap[id] ?? id, count }))
          .sort((a, b) => b.count - a.count);

        result.push({ categoryId: catId, categoryTitle: catId, nominees });
      }
      setStats(result);
    } catch (e) {
      console.error('Stats error:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Bouton flottant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Panel ouvert */}
        {open && (
          <div className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: '320px', maxHeight: '70vh', background: '#0f0d09', border: '1px solid rgba(201,162,39,0.3)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'rgba(201,162,39,0.15)' }}>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{ color: '#c9a227' }} />
                <span className="text-sm font-black text-white">Admin Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/${locale}/admin/login`}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:text-white"
                  style={{ color: '#9a8870', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Dashboard →
                </a>
                <button onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:text-white transition-all" style={{ color: '#665544' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'none' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#c9a227' }}>
                  Votes par catégorie
                </span>
                <button onClick={loadStats} disabled={loadingStats}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all hover:text-white"
                  style={{ color: '#9a8870', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {loadingStats ? '...' : 'Actualiser'}
                </button>
              </div>

              {stats.length === 0 && !loadingStats && (
                <p className="text-xs text-center py-6" style={{ color: '#4a3a2a' }}>
                  Cliquez sur Actualiser pour charger les stats
                </p>
              )}

              <div className="space-y-4">
                {stats.map(cat => (
                  <div key={cat.categoryId}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#9a8870' }}>
                      {cat.categoryTitle}
                    </p>
                    <div className="space-y-1">
                      {cat.nominees.slice(0, 5).map((nom, i) => {
                        const max = cat.nominees[0]?.count ?? 1;
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-xs truncate text-white">{nom.name}</span>
                                <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: '#c9a227' }}>{nom.count}</span>
                              </div>
                              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <div className="h-full rounded-full"
                                  style={{ width: `${(nom.count / max) * 100}%`, background: i === 0 ? '#c9a227' : 'rgba(201,162,39,0.4)' }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer — déconnexion */}
            <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(201,162,39,0.1)' }}>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: 'rgba(255,60,60,0.08)', color: '#ff6644', border: '1px solid rgba(255,60,60,0.2)' }}>
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        )}

        {/* Bouton toggle */}
        <button onClick={() => { setOpen(!open); if (!open && stats.length === 0) loadStats(); }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-sm text-black shadow-xl transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', boxShadow: '0 4px 24px rgba(201,162,39,0.35)' }}>
          <BarChart2 className="w-4 h-4" />
          Admin
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
