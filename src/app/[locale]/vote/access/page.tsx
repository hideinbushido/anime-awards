'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, XCircle } from 'lucide-react';
import { useLocale } from 'next-intl';
import VoteFlow from '@/components/vote/VoteFlow';
import { PLACEHOLDER_CATEGORIES, PLACEHOLDER_NOMINEES } from '@/app/[locale]/nominees/page';

interface AccessState {
  status: 'loading' | 'ready' | 'error';
  voterName?: string;
  voterEmail?: string;
  error?: string;
}

export default function VoteAccessPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [state, setState] = useState<AccessState>({ status: 'loading' });

  const token = searchParams.get('token') ?? '';
  const devName = searchParams.get('name');
  const devEmail = searchParams.get('email');
  const isDev = searchParams.get('dev') === '1';

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', error: 'Lien invalide. Recommencez depuis la page de vote.' });
      return;
    }

    const url = isDev
      ? `/api/vote/validate-access?token=${encodeURIComponent(token)}&dev=1&name=${encodeURIComponent(devName ?? '')}&email=${encodeURIComponent(devEmail ?? '')}`
      : `/api/vote/validate-access?token=${encodeURIComponent(token)}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setState({ status: 'ready', voterName: data.voterName, voterEmail: data.voterEmail });
        } else {
          setState({ status: 'error', error: data.error });
        }
      })
      .catch(() => setState({ status: 'error', error: 'Erreur réseau. Réessayez.' }));
  }, [token]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080600' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#c9a227' }} />
          <p className="text-white font-bold">Vérification en cours…</p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#080600' }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <XCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
          </div>
          <h2 className="text-xl font-black text-white mb-3">Accès refusé</h2>
          <p className="text-sm mb-6" style={{ color: '#ef4444' }}>{state.error}</p>
          <a href={`/${locale}/vote`}
            className="inline-block px-6 py-3 rounded-xl font-bold text-black transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
            Recommencer
          </a>
        </div>
      </div>
    );
  }

  // Ready — show vote flow directly
  return (
    <>
      {/* Spotlight */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.08) 0%, transparent 65%)' }} />

      <div className="pt-8 pb-20 relative z-10" style={{ background: '#080600', minHeight: '100vh' }}>
        <div className="container-mobile">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-black mb-3">
              <span className="gradient-text">Phase de Vote</span>
            </h1>
            <p className="text-base" style={{ color: '#9a8870' }}>
              Bonjour <span className="text-white font-bold">{state.voterName}</span> — votez pour vos animés préférés
            </p>
          </div>

          <VoteFlow
            categories={PLACEHOLDER_CATEGORIES}
            nomineesByCategory={PLACEHOLDER_NOMINEES}
            eventId="demo"
            locale={locale}
            voterName={state.voterName!}
            voterEmail={state.voterEmail!}
            accessToken={token}
          />
        </div>
      </div>
    </>
  );
}
