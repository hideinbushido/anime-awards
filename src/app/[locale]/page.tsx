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
          {/* Vidéo de fond */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 1.00 }}
          >
            <source src="/Gold_fond.mp4" type="video/mp4" />
          </video>

          {/* Overlay sombre pour lisibilité du texte */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(7,7,7,0.4) 0%, rgba(7,7,7,0.2) 50%, rgba(7,7,7,0.7) 100%)' }}
          />

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
                style={{ boxShadow: '0 0 25px rgba(212,160,23,0.45), 0 0 60px rgba(212,160,23,0.15)' }}
              >
                <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Voter maintenant
              </Link>
              <Link
                href={`/${locale}/categories`}
                className="flex items-center gap-2 px-8 py-4 border border-[#d4a017]/40 hover:border-[#d4a017]/80 rounded-xl text-[#f0c040] hover:text-white font-semibold text-lg transition-all hover:bg-[#d4a017]/5"
                style={{ boxShadow: '0 0 15px rgba(212,160,23,0.15)' }}
              >
                Voir les Catégories
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

        {/* ─── Animateurs du LIVE ────────────────────────────────────────── */}
        <section className="relative py-24 overflow-hidden bg-[#070707]" style={{ borderTop: '1px solid rgba(212,160,23,0.15)' }}>
          {/* ── FOND VIDÉO SECTION 3 — change uniquement le nom du fichier ── */}
          <video autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 1.50 }}
          >
            <source src="/section3_fond.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(7,7,7,0.7)' }} />
          {/* ────────────────────────────────────────────────────────────── */}
          <div className="container-mobile relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* GAUCHE — Cadres photos */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-8 items-center justify-center">
                {/* Cadre présentateur 1 */}
                <div className="group relative flex flex-col items-center gap-4">
                  <div
                    className="w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                    style={{
                      border: '2px solid rgba(212,160,23,0.4)',
                      background: 'linear-gradient(135deg, #0e0e0e, #1a1200)',
                      boxShadow: '0 0 40px rgba(212,160,23,0.12)',
                    }}
                  >
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users className="w-14 h-14 text-[#d4a017]" />
                      <span className="text-[#d4a017] text-xs font-semibold tracking-widest uppercase">Photo</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">Présentateur 1</p>
                    <p className="text-[#d4a017]/60 text-sm">Animateur</p>
                  </div>
                </div>

                {/* Cadre présentateur 2 */}
                <div className="group relative flex flex-col items-center gap-4">
                  <div
                    className="w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                    style={{
                      border: '2px solid rgba(212,160,23,0.4)',
                      background: 'linear-gradient(135deg, #0e0e0e, #1a1200)',
                      boxShadow: '0 0 40px rgba(212,160,23,0.12)',
                    }}
                  >
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users className="w-14 h-14 text-[#d4a017]" />
                      <span className="text-[#d4a017] text-xs font-semibold tracking-widest uppercase">Photo</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">Présentateur 2</p>
                    <p className="text-[#d4a017]/60 text-sm">Animateur</p>
                  </div>
                </div>
              </div>

              {/* DROITE — Texte décalé à droite */}
              <div className="flex-1 text-center lg:text-right lg:pl-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a017]/30 bg-[#d4a017]/5 text-[#d4a017] text-xs font-semibold tracking-widest uppercase mb-6">
                  <Star className="w-3 h-3" />
                  Présentation
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                  Les Animateurs<br />
                  <span style={{
                    background: 'linear-gradient(135deg, #f0c040, #d4a017)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>du LIVE</span>
                </h2>
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#d4a017] to-transparent mx-auto lg:ml-auto lg:mr-0 mb-6 opacity-50" />
                <p className="text-gray-400 text-base max-w-sm mx-auto lg:ml-auto lg:mr-0 mb-8 leading-relaxed">
                  Découvrez qui animera la cérémonie officielle en direct sur TikTok.
                </p>
                <a
                  href="https://www.tiktok.com/@ricokouame"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black transition-all btn-gold lg:float-right"
                  style={{ boxShadow: '0 0 20px rgba(212,160,23,0.35)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z" />
                  </svg>
                  Suivre le Live
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ─── TikTok CTA ───────────────────────────────────────────────── */}
        <section className="py-20 bg-[#070707]" style={{ borderTop: '1px solid rgba(212,160,23,0.15)' }}>
          <div className="container-mobile">
            <div className="rounded-3xl p-8 sm:p-12 text-center"
              style={{
                background: 'linear-gradient(135deg, #e0d64c 0%, rgba(3, 3, 3, 0.1) 50%, #4e4c2f 100%)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                boxShadow: '0 0 60px rgba(78, 85, 53, 0.36), inset 0 0 60px rgba(163, 142, 90, 0.03)',
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
              <a
                href="https://www.tiktok.com/@ricokouame"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
                style={{ boxShadow: '0 0 20px rgba(255,255,255,0.15)' }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z" />
                </svg>
                {t('tiktok.follow')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
