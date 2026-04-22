'use client';

import { useEffect, useState } from 'react';
import { Trophy, Lock } from 'lucide-react';
import type { Category } from '@/lib/types';

// May 2 2026 at 20:00 UTC (4pm Eastern)
const LIVE_DATE = new Date('2026-05-02T20:00:00Z');

function getTimeLeft() {
  const diff = LIVE_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

interface Props {
  categories: Category[];
  results: Record<string, { winner: string; anime?: string; imageUrl?: string }>;
}

export default function ResultatsClient({ categories, results }: Props) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const hasResults = Object.values(results).some(r => r.winner !== '');

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (!hasResults) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="rounded-2xl p-10"
          style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.25)' }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}>
            <Lock className="w-9 h-9" style={{ color: '#c9a227' }} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Résultats sous scellés</h2>
          <p className="text-base mb-8" style={{ color: '#9a8870' }}>
            Les gagnants seront révélés en direct le <strong style={{ color: '#f0e8d0' }}>2 mai 2026</strong> sur TikTok.
          </p>

          {timeLeft ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c9a227' }}>
                Révélation dans
              </p>
              <div className="flex items-center justify-center gap-3 mb-6">
                {[
                  { label: 'Jours',    value: timeLeft.days },
                  { label: 'Heures',   value: timeLeft.hours },
                  { label: 'Minutes',  value: timeLeft.minutes },
                  { label: 'Secondes', value: timeLeft.seconds },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="rounded-xl px-4 py-3 min-w-[56px] text-center"
                        style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.25)' }}>
                        <span className="text-2xl font-black tabular-nums" style={{ color: '#ffd250' }}>
                          {pad(value)}
                        </span>
                      </div>
                      <span className="text-xs mt-1" style={{ color: '#6b5e3a' }}>{label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <span className="text-xl font-black mb-5" style={{ color: '#c9a227' }}>:</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm mb-6" style={{ color: '#c9a227' }}>
              🎉 Le live a eu lieu — les résultats arrivent !
            </p>
          )}

          <a href="https://www.tiktok.com/@ricokouame" target="_blank" rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-xl font-black text-sm text-black"
            style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
            Suivre le live sur TikTok →
          </a>
        </div>
      </div>
    );
  }

  // Results revealed
  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const result = results[cat.id];
        const revealed = result?.winner && result.winner !== '';
        return (
          <div key={cat.id} className="rounded-2xl p-5 flex items-center gap-5"
            style={{
              background: revealed ? 'rgba(201,162,39,0.04)' : '#111108',
              border: `1px solid ${revealed ? 'rgba(201,162,39,0.35)' : 'rgba(255,255,255,0.06)'}`,
            }}>
            {revealed ? (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
                <Trophy className="w-5 h-5 text-black" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Lock className="w-4 h-4" style={{ color: '#4a3a2a' }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#665544' }}>
                {cat.titleFr}
              </p>
              {revealed ? (
                <>
                  <p className="font-black text-white text-base leading-tight">{result.winner}</p>
                  {result.anime && <p className="text-sm mt-0.5" style={{ color: '#9a8870' }}>{result.anime}</p>}
                </>
              ) : (
                <p className="text-sm" style={{ color: '#4a3a2a' }}>À révéler</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
