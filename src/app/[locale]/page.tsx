import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Trophy, Play, ChevronRight, Star, Tv, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CountdownTimer from '@/components/home/CountdownTimer';
import { getActiveEvent, getCategories } from '@/lib/firestore';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const tNav = await getTranslations('nav');

  let event = null;
  let categories: any[] = [];

  try {
    event = await getActiveEvent();
    if (event) {
      categories = await getCategories(event.id);
    }
  } catch {
    // Firebase not configured yet — show placeholder UI
  }

  const isVotingOpen = event?.status === 'voting_open';
  const isVotingClosed =
    event?.status === 'voting_closed' || event?.status === 'results_published';

  const heroLabel = isVotingOpen
    ? t('hero.votingOpen')
    : isVotingClosed
    ? t('hero.votingClosed')
    : t('hero.votingOpensSoon');

  const featuredCategories = categories.slice(0, 6);

  return (
    <>
      <Navbar />
      <main>
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#ec4899' : '#f59e0b',
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          <div className="hero-gradient absolute inset-0 pointer-events-none" />

          <div className="container-mobile text-center z-10 py-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              {heroLabel}
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-4 leading-tight">
              <span className="gradient-text">Anime</span>
              <br />
              <span className="text-white">Awards</span>
            </h1>

            <p className="text-purple-400 text-xl sm:text-2xl font-bold mb-4">
              {t('hero.edition')}
            </p>

            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10">
              {t('hero.slogan')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href={`/${locale}/vote`}
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              >
                <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {t('hero.ctaVote')}
              </Link>
              <Link
                href={`/${locale}/nominees`}
                className="flex items-center gap-2 px-8 py-4 border border-[#1e1e2e] hover:border-purple-500/50 rounded-xl text-gray-300 hover:text-white font-semibold text-lg transition-all hover:bg-white/5"
              >
                {t('hero.ctaNominees')}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Countdown */}
            {event && isVotingOpen && (
              <div className="bg-[#111118]/80 border border-[#1e1e2e] rounded-2xl p-6 sm:p-8 max-w-lg mx-auto mb-8">
                <CountdownTimer
                  targetDate={event.voteCloseDate}
                  label={t('countdown.voteClose')}
                />
              </div>
            )}
            {event && !isVotingOpen && event.liveDate && (
              <div className="bg-[#111118]/80 border border-[#1e1e2e] rounded-2xl p-6 sm:p-8 max-w-lg mx-auto mb-8">
                <CountdownTimer
                  targetDate={event.liveDate}
                  label={t('countdown.live')}
                />
              </div>
            )}
          </div>
        </section>

        {/* ─── How it works ─────────────────────────────────────────────── */}
        <section className="py-20 border-t border-[#1e1e2e]">
          <div className="container-mobile">
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              <span className="gradient-text">{t('howItWorks.title')}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  icon: Tv,
                  title: t('howItWorks.step1Title'),
                  desc: t('howItWorks.step1Desc'),
                  color: 'from-purple-600 to-purple-800',
                  step: '01',
                  href: `/${locale}/nominees`,
                },
                {
                  icon: Trophy,
                  title: t('howItWorks.step2Title'),
                  desc: t('howItWorks.step2Desc'),
                  color: 'from-pink-600 to-pink-800',
                  step: '02',
                  href: `/${locale}/vote`,
                },
                {
                  icon: Play,
                  title: t('howItWorks.step3Title'),
                  desc: t('howItWorks.step3Desc'),
                  color: 'from-amber-600 to-amber-800',
                  step: '03',
                  href: event?.tiktokUrl || '#',
                },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="group bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 card-glow text-center"
                >
                  <div className="text-6xl font-black text-[#1e1e2e] mb-4">{item.step}</div>
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured Categories ───────────────────────────────────────── */}
        <section className="py-20 border-t border-[#1e1e2e]">
          <div className="container-mobile">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl sm:text-4xl font-black">
                <span className="gradient-text">{t('featured.title')}</span>
              </h2>
              <Link
                href={`/${locale}/categories`}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                {t('featured.seeAll')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {featuredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredCategories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/${locale}/nominees?category=${cat.id}`}
                    className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 card-glow group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-gray-500 bg-[#0a0a0f] px-2 py-1 rounded-full">
                        {cat.nomineeCount ?? '—'} {t('featured.nominees')}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">
                      {locale === 'fr' ? cat.titleFr : cat.titleEn}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {locale === 'fr' ? cat.descriptionFr : cat.descriptionEn}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Best Anime', desc: 'Le meilleur anime de l\'année' },
                  { title: 'Best Character', desc: 'Le personnage préféré des fans' },
                  { title: 'Best Opening', desc: 'L\'opening le plus mémorable' },
                  { title: 'Best Villain', desc: 'Le meilleur antagoniste' },
                  { title: 'Best Fight', desc: 'Le combat le plus épique' },
                  { title: 'Most Emotional', desc: 'L\'anime qui a fait pleurer' },
                ].map((cat, i) => (
                  <div
                    key={i}
                    className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 opacity-60"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/50 to-pink-600/50 flex items-center justify-center mb-3">
                      <Trophy className="w-5 h-5 text-white/50" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">{cat.title}</h3>
                    <p className="text-gray-500 text-sm">{cat.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── TikTok CTA ───────────────────────────────────────────────── */}
        <section className="py-20 border-t border-[#1e1e2e]">
          <div className="container-mobile">
            <div className="bg-gradient-to-r from-[#111118] via-purple-900/20 to-[#111118] border border-purple-500/20 rounded-3xl p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z" />
                </svg>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                {t('tiktok.title')}
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8">{t('tiktok.subtitle')}</p>
              {event?.tiktokUrl ? (
                <a
                  href={event.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z" />
                  </svg>
                  {t('tiktok.follow')}
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                  {t('tiktok.follow')}
                </span>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
