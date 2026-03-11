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
        {/* ─── Hero — Style Prestige/Or ──────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden bg-[#070707]">
          {/* Spotlight radial depuis le haut */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(109,40,217,0.3) 0%, transparent 65%)',
            }}
          />
          {/* Lueur or depuis le bas */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 30% at 50% 105%, rgba(212,160,23,0.15) 0%, transparent 60%)',
            }}
          />

          {/* Particules dorées */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${(i * 37 + 10) % 100}%`,
                  top: `${(i * 53 + 5) % 100}%`,
                  width: `${(i % 3) + 1}px`,
                  height: `${(i % 3) + 1}px`,
                  background: i % 2 === 0 ? '#d4a017' : '#6d28d9',
                  opacity: 0.3,
                  animation: `float ${4 + (i % 4)}s ease-in-out infinite`,
                  animationDelay: `${(i % 5) * 0.6}s`,
                }}
              />
            ))}
          </div>

          <div className="container-mobile text-center z-10 py-20">
            {/* Badge prestige */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/10 text-[#f0c040] text-sm font-semibold mb-8 tracking-wider uppercase">
              <Star className="w-4 h-4" />
              {heroLabel}
            </div>

            {/* Titre */}
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-4 leading-none tracking-tight">
              <span style={{
                background: 'linear-gradient(135deg, #f0c040, #d4a017, #c9a227)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Anime</span>
              <br />
              <span className="text-white">Awards</span>
            </h1>

            {/* Ligne or */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4a017]" />
              <p className="text-[#d4a017] text-lg sm:text-xl font-bold tracking-[0.3em] uppercase">
                {t('hero.edition')}
              </p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4a017]" />
            </div>

            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-12">
              {t('hero.slogan')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href={`/${locale}/vote`}
                className="group flex items-center gap-2 px-8 py-4 rounded-xl text-black font-bold text-lg transition-all btn-gold"
              >
                <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {t('hero.ctaVote')}
              </Link>
              <Link
                href={`/${locale}/nominees`}
                className="flex items-center gap-2 px-8 py-4 border border-[#d4a017]/30 hover:border-[#d4a017]/70 rounded-xl text-[#f0c040] hover:text-white font-semibold text-lg transition-all hover:bg-[#d4a017]/5"
              >
                {t('hero.ctaNominees')}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Countdown */}
            {event && isVotingOpen && (
              <div className="bg-[#0e0e0e]/90 border border-[#d4a017]/25 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto mb-8 shadow-[0_0_40px_rgba(212,160,23,0.1)]">
                <CountdownTimer
                  targetDate={event.voteCloseDate}
                  label={t('countdown.voteClose')}
                />
              </div>
            )}
            {event && !isVotingOpen && event.liveDate && (
              <div className="bg-[#0e0e0e]/90 border border-[#d4a017]/25 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto mb-8 shadow-[0_0_40px_rgba(212,160,23,0.1)]">
                <CountdownTimer
                  targetDate={event.liveDate}
                  label={t('countdown.live')}
                />
              </div>
            )}
          </div>
        </section>

        {/* ─── How it works ─────────────────────────────────────────────── */}
        <section className="py-20 bg-[#070707]" style={{ borderTop: '1px solid rgba(212,160,23,0.15)' }}>
          <div className="container-mobile">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black mb-3">
                <span style={{
                  background: 'linear-gradient(135deg, #f0c040, #d4a017)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{t('howItWorks.title')}</span>
              </h2>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#d4a017] to-transparent mx-auto opacity-50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              {[
                {
                  icon: Tv,
                  title: t('howItWorks.step1Title'),
                  desc: t('howItWorks.step1Desc'),
                  color: 'from-[#6d28d9] to-[#4c1d95]',
                  step: '01',
                  href: `/${locale}/nominees`,
                },
                {
                  icon: Trophy,
                  title: t('howItWorks.step2Title'),
                  desc: t('howItWorks.step2Desc'),
                  color: 'from-[#d4a017] to-[#b8860b]',
                  step: '02',
                  href: `/${locale}/vote`,
                },
                {
                  icon: Play,
                  title: t('howItWorks.step3Title'),
                  desc: t('howItWorks.step3Desc'),
                  color: 'from-[#6d28d9] to-[#d4a017]',
                  step: '03',
                  href: event?.tiktokUrl || '#',
                },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="group bg-[#0e0e0e] border rounded-2xl p-8 card-glow text-center"
                  style={{ borderColor: 'rgba(212,160,23,0.15)' }}
                >
                  <div className="text-6xl font-black mb-4" style={{ color: 'rgba(212,160,23,0.1)' }}>{item.step}</div>
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(212,160,23,0.2)]`}
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
        <section className="py-20 bg-[#070707]" style={{ borderTop: '1px solid rgba(212,160,23,0.15)' }}>
          <div className="container-mobile">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl sm:text-4xl font-black">
                <span style={{
                  background: 'linear-gradient(135deg, #f0c040, #d4a017)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{t('featured.title')}</span>
              </h2>
              <Link
                href={`/${locale}/categories`}
                className="flex items-center gap-1 text-[#d4a017] hover:text-[#f0c040] text-sm font-medium transition-colors"
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
                    className="bg-[#0e0e0e] rounded-xl p-6 card-glow group"
                    style={{ border: '1px solid rgba(212,160,23,0.15)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a017] to-[#6d28d9] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-[#d4a017]/60 bg-[#d4a017]/5 border border-[#d4a017]/20 px-2 py-1 rounded-full">
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
                    className="bg-[#0e0e0e] rounded-xl p-6 opacity-70"
                    style={{ border: '1px solid rgba(212,160,23,0.12)' }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a017]/40 to-[#6d28d9]/40 flex items-center justify-center mb-3">
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
        <section className="py-20 bg-[#070707]" style={{ borderTop: '1px solid rgba(212,160,23,0.15)' }}>
          <div className="container-mobile">
            <div className="rounded-3xl p-8 sm:p-12 text-center"
              style={{
                background: 'linear-gradient(135deg, #0e0e0e 0%, rgba(109,40,217,0.1) 50%, #0e0e0e 100%)',
                border: '1px solid rgba(212,160,23,0.2)',
                boxShadow: '0 0 60px rgba(109,40,217,0.1), inset 0 0 60px rgba(212,160,23,0.03)',
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-black border border-[#d4a017]/30 flex items-center justify-center mx-auto mb-6">
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
