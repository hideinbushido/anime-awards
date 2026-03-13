import { getTranslations } from 'next-intl/server';
import { Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VoteForm from '@/components/vote/VoteForm';
import { getActiveEvent, getCategories, getNominees } from '@/lib/firestore';
import type { Category, Nominee } from '@/lib/types';

export default async function VotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('vote');

  let event = null;
  let categories: Category[] = [];
  let nomineesByCategory: Record<string, Nominee[]> = {};
  let firebaseError = false;

  try {
    event = await getActiveEvent();
    if (event) {
      categories = await getCategories(event.id);
      for (const cat of categories) {
        nomineesByCategory[cat.id] = await getNominees(cat.id);
      }
    }
  } catch {
    firebaseError = true;
  }

  const isVotingOpen = event?.status === 'voting_open';
  const isVotingClosed =
    event?.status === 'voting_closed' || event?.status === 'results_published';

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-mobile">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <p className="text-[#9a8870] text-lg">{t('subtitle')}</p>
          </div>

          {/* Voting closed */}
          {isVotingClosed && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-10">
                <Lock className="w-12 h-12 text-[#665544] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-3">{t('votingClosed')}</h2>
                <p className="text-[#9a8870]">{t('votingClosedDesc')}</p>
                {event?.tiktokUrl && (
                  <a
                    href={event.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Suivre sur TikTok
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Voting not open yet */}
          {!firebaseError && !event && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-10">
                <AlertTriangle className="w-12 h-12 text-[#c9a227] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-3">{t('votingNotOpen')}</h2>
                <p className="text-[#9a8870]">{t('votingNotOpenDesc')}</p>
                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 btn-gold font-bold rounded transition-all"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          )}

          {/* Firebase not configured */}
          {firebaseError && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-[#0f0d09] border rounded-2xl p-10">
                <AlertTriangle className="w-12 h-12 text-[#c9a227] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-3">Configuration requise</h2>
                <p className="text-[#9a8870] mb-4">
                  Firebase n'est pas encore configuré. Ajoutez vos variables d'environnement dans{' '}
                  <code className="text-[#c9a227] text-sm">.env.local</code> pour activer le vote.
                </p>
                <div className="bg-[#080600] rounded-xl p-4 text-left text-sm text-[#9a8870] font-mono">
                  <p>NEXT_PUBLIC_FIREBASE_API_KEY=...</p>
                  <p>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...</p>
                  <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID=...</p>
                  <p>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...</p>
                  <p>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...</p>
                  <p>NEXT_PUBLIC_FIREBASE_APP_ID=...</p>
                  <p>ADMIN_EMAIL=admin@example.com</p>
                </div>
              </div>
            </div>
          )}

          {/* Voting form */}
          {isVotingOpen && categories.length > 0 && (
            <VoteForm
              categories={categories}
              nomineesByCategory={nomineesByCategory}
              eventId={event!.id}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
