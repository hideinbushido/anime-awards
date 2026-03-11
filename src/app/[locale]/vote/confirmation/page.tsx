import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { CheckCircle, Heart, Share2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getActiveEvent } from '@/lib/firestore';
import ConfirmationClient from '@/components/vote/ConfirmationClient';

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('confirmation');

  let event = null;
  try {
    event = await getActiveEvent();
  } catch {}

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen flex items-center">
        <div className="container-mobile">
          <div className="max-w-2xl mx-auto">
            {/* Success card */}
            <div className="bg-[#111118] border border-green-500/30 rounded-3xl p-8 sm:p-12 text-center mb-8">
              {/* Animated check */}
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 pulse-glow">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
                {t('title')}
              </h1>
              <p className="text-purple-400 font-semibold text-lg mb-4">{t('subtitle')}</p>
              <p className="text-gray-400 mb-8">{t('message')}</p>

              {event?.liveDate && (
                <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl p-4 mb-8 inline-block">
                  <p className="text-sm text-gray-500 mb-1">{t('liveDate')}</p>
                  <p className="text-white font-bold">
                    {new Date(event.liveDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {event?.tiktokUrl && (
                  <a
                    href={event.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z" />
                    </svg>
                    {t('followTiktok')}
                  </a>
                )}
                <ConfirmationClient shareLabel={t('share')} />
              </div>
            </div>

            {/* Invite friends */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6 text-center">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">{t('inviteFriends')}</h3>
              <p className="text-gray-400 text-sm mb-4">{t('inviteDesc')}</p>
            </div>

            <div className="text-center mt-8">
              <Link
                href={`/${locale}`}
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                ← {t('backHome')}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
