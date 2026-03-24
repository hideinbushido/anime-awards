'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle, XCircle, Loader2, Trophy } from 'lucide-react';
import { PLACEHOLDER_CATEGORIES, PLACEHOLDER_NOMINEES } from '@/app/[locale]/nominees/page';
import type { VoteAnswer } from '@/lib/types';

interface ConfirmResult {
  success: boolean;
  voterName?: string;
  answers?: VoteAnswer[];
  error?: string;
}

function getNomineeName(categoryId: string, nomineeId: string): string {
  const nominees = PLACEHOLDER_NOMINEES[categoryId] ?? [];
  return nominees.find(n => n.id === nomineeId)?.name ?? nomineeId;
}

function getCategoryTitle(categoryId: string): string {
  return PLACEHOLDER_CATEGORIES.find(c => c.id === categoryId)?.titleFr ?? categoryId;
}

export default function VoteConfirmPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const token = searchParams.get('token');
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<ConfirmResult | null>(null);

  useEffect(() => {
    if (!token) {
      setState('error');
      setResult({ success: false, error: 'Token manquant dans l\'URL.' });
      return;
    }

    fetch(`/api/vote/confirm?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then((data: ConfirmResult) => {
        if (data.success) {
          setState('success');
          setResult(data);
        } else {
          setState('error');
          setResult(data);
        }
      })
      .catch(() => {
        setState('error');
        setResult({ success: false, error: 'Erreur réseau. Réessayez.' });
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#080600' }}>
      {/* Spotlight */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.1) 0%, transparent 65%)' }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Loading */}
        {state === 'loading' && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#c9a227' }} />
            <p className="text-white font-bold text-lg">Validation de ton vote…</p>
            <p className="text-sm mt-1" style={{ color: '#665544' }}>Un instant…</p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && result && (
          <div className="text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', boxShadow: '0 0 50px rgba(201,162,39,0.3)' }}>
              <CheckCircle className="w-10 h-10 text-black" />
            </div>

            <h1 className="text-3xl font-black text-white mb-2">Vote confirmé !</h1>
            <p className="text-lg mb-1" style={{ color: '#9a8870' }}>
              Merci <span className="text-white font-bold">{result.voterName}</span> 🎉
            </p>
            <p className="text-sm mb-8" style={{ color: '#665544' }}>
              Tes votes ont été enregistrés. Les résultats seront annoncés le <strong className="text-white">2 mai</strong> en direct sur TikTok.
            </p>

            {/* Vote recap */}
            {result.answers && result.answers.length > 0 && (
              <div className="text-left rounded-2xl p-5 mb-8"
                style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.15)' }}>
                <p className="text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2"
                  style={{ color: '#c9a227' }}>
                  <Trophy className="w-3.5 h-3.5" />
                  Récapitulatif de tes votes
                </p>
                <div className="space-y-2">
                  {PLACEHOLDER_CATEGORIES
                    .filter(cat => result.answers!.some(a => a.categoryId === cat.id))
                    .map(cat => {
                      const answer = result.answers!.find(a => a.categoryId === cat.id);
                      const nomineeName = answer ? getNomineeName(cat.id, answer.nomineeId) : '—';
                      return (
                        <div key={cat.id} className="flex items-center justify-between gap-3 text-sm py-1"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span className="truncate" style={{ color: '#665544' }}>{cat.titleFr}</span>
                          <span className="font-semibold text-white truncate text-right ml-3">{nomineeName}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <a href={`/${locale}`}
              className="inline-block px-8 py-3.5 rounded-xl font-black text-black transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
              Retour à l&apos;accueil
            </a>
          </div>
        )}

        {/* Error */}
        {state === 'error' && result && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)' }}>
              <XCircle className="w-10 h-10" style={{ color: '#ef4444' }} />
            </div>
            <h1 className="text-2xl font-black text-white mb-3">Lien invalide</h1>
            <p className="text-sm mb-8 px-4" style={{ color: '#ef4444' }}>
              {result.error}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={`/${locale}/vote`}
                className="px-6 py-3 rounded-xl font-bold text-black transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
                Recommencer le vote
              </a>
              <a href={`/${locale}`}
                className="px-6 py-3 rounded-xl font-semibold transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#9a8870', border: '1px solid rgba(255,255,255,0.08)' }}>
                Accueil
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
