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

        {/* ─── Hero — Anime Universe ──────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden bg-[#03030a]">

          {/* ── FOND VIDÉO HERO — change le nom du fichier ici ── */}
          <video autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.55 }}
          >
            <source src="/style3_fond1.mp4" type="video/mp4" />
          </video>
          {/* ─────────────────────────────────────────────────── */}

          {/* Overlay sombre avec dégradé cosmique */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(3,3,10,0.7) 0%, rgba(3,3,10,0.3) 40%, rgba(3,3,10,0.9) 100%)' }}
          />

          {/* Nébuleuse violette haut-centre */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.28) 0%, transparent 65%)' }}
          />
          {/* Nébuleuse rose droite */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at right, rgba(236,72,153,0.15) 0%, transparent 65%)' }}
          />
          {/* Nébuleuse bleue gauche */}
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at left, rgba(59,130,246,0.12) 0%, transparent 65%)' }}
          />

          {/* Anneaux de portail cosmique */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Anneau extérieur */}
            <div className="absolute" style={{
              width: '700px', height: '700px', borderRadius: '50%',
              border: '1px solid rgba(124,58,237,0.2)',
              boxShadow: '0 0 40px rgba(124,58,237,0.08), inset 0 0 40px rgba(124,58,237,0.04)',
              animation: 'portal-spin 20s linear infinite',
            }} />
            {/* Anneau intermédiaire */}
            <div className="absolute" style={{
              width: '520px', height: '520px', borderRadius: '50%',
              border: '1px solid rgba(168,85,247,0.25)',
              boxShadow: '0 0 30px rgba(168,85,247,0.1), inset 0 0 30px rgba(168,85,247,0.05)',
              animation: 'portal-spin-reverse 14s linear infinite',
            }} />
            {/* Anneau intérieur rose */}
            <div className="absolute" style={{
              width: '360px', height: '360px', borderRadius: '50%',
              border: '1px solid rgba(236,72,153,0.2)',
              boxShadow: '0 0 25px rgba(236,72,153,0.1), inset 0 0 25px rgba(236,72,153,0.04)',
              animation: 'portal-spin 10s linear infinite',
            }} />
          </div>

          <div className="container-mobile text-center z-10 py-20">

            {/* Badge univers */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-8 tracking-widest uppercase"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(168,85,247,0.35)',
                color: '#c084fc',
                boxShadow: '0 0 20px rgba(124,58,237,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Star className="w-4 h-4" />
              ✦ {heroLabel} ✦
            </div>

            {/* Titre */}
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-4 leading-none tracking-tight">
              <span style={{
                background: 'linear-gradient(135deg, #c084fc, #ec4899, #818cf8)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 6s ease infinite',
              }}>Anime</span>
              <br />
              <span className="text-white" style={{ textShadow: '0 0 50px rgba(124,58,237,0.5), 0 0 100px rgba(236,72,153,0.2)' }}>Awards</span>
            </h1>

            {/* Séparateur étoilé */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#a855f7]" />
              <p className="text-[#c084fc] text-lg sm:text-xl font-bold tracking-[0.3em] uppercase"
                style={{ textShadow: '0 0 15px rgba(192,132,252,0.6)' }}
              >
                {t('hero.edition')}
              </p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#ec4899]" />
            </div>

            <p className="text-[#b09cc0] text-base sm:text-lg max-w-2xl mx-auto mb-12">
              {t('hero.slogan')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href={`/${locale}/vote`}
                className="group flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-all btn-gold"
                style={{ boxShadow: '0 0 30px rgba(124,58,237,0.5), 0 0 70px rgba(236,72,153,0.2)', animation: 'pulse-neon 2.5s ease-in-out infinite' }}
              >
                <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Voter maintenant
              </Link>
              <Link
                href={`/${locale}/categories`}
                className="flex items-center gap-2 px-8 py-4 rounded-full text-[#c084fc] hover:text-white font-semibold text-lg transition-all hover:bg-[#7c3aed]/15"
                style={{ border: '1px solid rgba(168,85,247,0.4)', backdropFilter: 'blur(10px)', boxShadow: '0 0 15px rgba(124,58,237,0.15)' }}
              >
                Voir les Catégories
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {event && isVotingOpen && (
              <div className="border rounded-2xl p-6 sm:p-8 max-w-lg mx-auto mb-8"
                style={{ background: 'rgba(8,5,26,0.85)', borderColor: 'rgba(168,85,247,0.3)', boxShadow: '0 0 40px rgba(124,58,237,0.15)', backdropFilter: 'blur(14px)' }}
              >
                <CountdownTimer targetDate={event.voteCloseDate} label={t('countdown.voteClose')} />
              </div>
            )}
            {event && !isVotingOpen && event.liveDate && (
              <div className="border rounded-2xl p-6 sm:p-8 max-w-lg mx-auto mb-8"
                style={{ background: 'rgba(8,5,26,0.85)', borderColor: 'rgba(168,85,247,0.3)', boxShadow: '0 0 40px rgba(124,58,237,0.15)', backdropFilter: 'blur(14px)' }}
              >
                <CountdownTimer targetDate={event.liveDate} label={t('countdown.live')} />
              </div>
            )}
          </div>

          {/* Fondu bas vers section suivante */}
          <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #03030a)' }}
          />
        </section>

        {/* ─── How it works — Cosmos ──────────────────────────────────── */}
        <section className="relative py-20 overflow-hidden" style={{
          borderTop: '1px solid rgba(124,58,237,0.15)',
          background: 'linear-gradient(160deg, #0a0520 0%, #03030a 40%, #0d0525 70%, #03030a 100%)',
        }}>
          {/* Nébuleuse violette haut-gauche */}
          <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top left, rgba(124,58,237,0.15) 0%, transparent 65%)' }} />
          {/* Nébuleuse rose bas-droite */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at bottom right, rgba(236,72,153,0.1) 0%, transparent 65%)' }} />
          {/* Étoiles CSS */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 55% 15%, rgba(220,200,255,0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 80% 40%, rgba(255,255,255,0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 35% 70%, rgba(255,210,240,0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.35) 0%, transparent 100%)
            `,
          }} />

          <div className="container-mobile relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black mb-3">
                <span style={{
                  background: 'linear-gradient(135deg, #c084fc, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{t('howItWorks.title')}</span>
              </h2>
              <div className="h-px w-32 mx-auto opacity-50" style={{ background: 'linear-gradient(90deg, transparent, #a855f7, #ec4899, transparent)' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {[
                { icon: Tv,     title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc'), color: 'from-[#7c3aed] to-[#4c1d95]', glow: 'rgba(124,58,237,0.3)',  step: '01', href: `/${locale}/nominees` },
                { icon: Trophy, title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc'), color: 'from-[#a855f7] to-[#7c3aed]', glow: 'rgba(168,85,247,0.3)',  step: '02', href: `/${locale}/vote` },
                { icon: Play,   title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc'), color: 'from-[#ec4899] to-[#a855f7]', glow: 'rgba(236,72,153,0.3)',  step: '03', href: event?.tiktokUrl || '#' },
              ].map((item, i) => (
                <Link key={i} href={item.href}
                  className="group border rounded-2xl p-8 card-glow text-center relative overflow-hidden"
                  style={{
                    background: 'rgba(8,5,26,0.7)',
                    borderColor: 'rgba(124,58,237,0.2)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  {/* Glow interne au hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at center, ${item.glow.replace('0.3', '0.06')} 0%, transparent 70%)` }}
                  />
                  <div className="text-6xl font-black mb-4 relative z-10"
                    style={{ color: 'rgba(168,85,247,0.1)' }}
                  >{item.step}</div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform relative z-10`}
                    style={{ boxShadow: `0 0 25px ${item.glow}` }}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">{item.title}</h3>
                  <p className="text-[#9580b0] text-sm relative z-10">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Animateurs du LIVE — Portail cosmique ─────────────────── */}
        <section className="relative py-24 overflow-hidden bg-[#03030a]"
          style={{ borderTop: '1px solid rgba(124,58,237,0.15)' }}
        >
          {/* ── FOND VIDÉO SECTION 3 — change uniquement le nom du fichier ── */}
          <video autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.6 }}
          >
            <source src="/style3_fond1.mp4" type="video/mp4" />
          </video>
          {/* ────────────────────────────────────────────────────────────── */}

          {/* Overlay nébuleux */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(3,3,10,0.88) 0%, rgba(12,5,30,0.75) 50%, rgba(3,3,10,0.85) 100%)' }} />
          {/* Nébuleuse violette haut-gauche */}
          <div className="absolute top-0 left-0 w-[700px] h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top left, rgba(124,58,237,0.2) 0%, transparent 60%)' }} />
          {/* Nébuleuse rose bas-droite */}
          <div className="absolute bottom-0 right-0 w-[600px] h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at bottom right, rgba(236,72,153,0.14) 0%, transparent 60%)' }} />
          {/* Nébuleuse bleue centre */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)' }} />
          {/* Fondu bas */}
          <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #03030a)' }} />

          <div className="container-mobile relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* GAUCHE — Cadres photos */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-8 items-center justify-center">
                {/* Cadre présentateur 1 — violet */}
                <div className="group relative flex flex-col items-center gap-4">
                  <div
                    className="w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-400 group-hover:scale-105"
                    style={{
                      border: '1px solid rgba(168,85,247,0.45)',
                      background: 'rgba(8,5,26,0.75)',
                      boxShadow: '0 0 0 1px rgba(124,58,237,0.15), 0 20px 50px rgba(124,58,237,0.2)',
                      backdropFilter: 'blur(14px)',
                    }}
                  >
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users className="w-14 h-14 text-[#c084fc]" />
                      <span className="text-[#c084fc] text-xs font-semibold tracking-widest uppercase">Photo</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">Présentateur 1</p>
                    <p className="text-[#c084fc]/60 text-sm">Animateur</p>
                  </div>
                </div>

                {/* Cadre présentateur 2 — rose */}
                <div className="group relative flex flex-col items-center gap-4">
                  <div
                    className="w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-400 group-hover:scale-105"
                    style={{
                      border: '1px solid rgba(236,72,153,0.4)',
                      background: 'rgba(8,5,26,0.75)',
                      boxShadow: '0 0 0 1px rgba(236,72,153,0.15), 0 20px 50px rgba(236,72,153,0.18)',
                      backdropFilter: 'blur(14px)',
                    }}
                  >
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users className="w-14 h-14 text-[#f472b6]" />
                      <span className="text-[#f472b6] text-xs font-semibold tracking-widest uppercase">Photo</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">Présentateur 2</p>
                    <p className="text-[#f472b6]/60 text-sm">Animateur</p>
                  </div>
                </div>
              </div>

              {/* DROITE — Texte */}
              <div className="flex-1 text-center lg:text-right lg:pl-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(168,85,247,0.35)',
                    color: '#c084fc',
                    boxShadow: '0 0 15px rgba(124,58,237,0.18)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Star className="w-3 h-3" />
                  ✦ Présentation ✦
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                  Les Animateurs<br />
                  <span style={{
                    background: 'linear-gradient(135deg, #c084fc, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>du LIVE</span>
                </h2>
                <div className="h-px w-20 mx-auto lg:ml-auto lg:mr-0 mb-6 opacity-60"
                  style={{ background: 'linear-gradient(90deg, transparent, #a855f7, #ec4899)' }}
                />
                <p className="text-[#9580b0] text-base max-w-sm mx-auto lg:ml-auto lg:mr-0 mb-8 leading-relaxed">
                  Découvrez qui animera la cérémonie officielle en direct sur TikTok.
                </p>
                <a
                  href="https://www.tiktok.com/@ricokouame"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all btn-gold lg:float-right"
                  style={{ boxShadow: '0 0 30px rgba(124,58,237,0.45), 0 0 60px rgba(236,72,153,0.2)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z" />
                  </svg>
                  Suivre le Live
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ─── TikTok CTA — Portail dimensionnel ─────────────────────── */}
        <section className="relative py-20 overflow-hidden" style={{
          borderTop: '1px solid rgba(124,58,237,0.15)',
          background: 'linear-gradient(160deg, #0a0520 0%, #03030a 40%, #100528 70%, #03030a 100%)',
        }}>
          {/* Nébuleuse violette haut-centre */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.18) 0%, transparent 65%)' }} />
          {/* Nébuleuse rose bas-gauche */}
          <div className="absolute bottom-0 left-0 w-[450px] h-[300px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at bottom left, rgba(236,72,153,0.12) 0%, transparent 65%)' }} />
          {/* Nébuleuse bleue bas-droit */}
          <div className="absolute bottom-0 right-0 w-[450px] h-[300px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at bottom right, rgba(59,130,246,0.1) 0%, transparent 65%)' }} />
          {/* Étoiles */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 8% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 90% 15%, rgba(220,200,255,0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 50% 85%, rgba(255,210,240,0.4) 0%, transparent 100%),
              radial-gradient(2px 2px at 75% 35%, rgba(255,255,255,0.35) 0%, transparent 100%),
              radial-gradient(1px 1px at 22% 65%, rgba(200,180,255,0.4) 0%, transparent 100%)
            `,
          }} />

          <div className="container-mobile relative z-10">
            {/* Card portail */}
            <div className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
              style={{
                background: 'rgba(8,5,26,0.75)',
                border: '1px solid rgba(168,85,247,0.28)',
                boxShadow: '0 0 0 1px rgba(124,58,237,0.1), 0 0 80px rgba(124,58,237,0.12), 0 0 40px rgba(236,72,153,0.06)',
                backdropFilter: 'blur(18px)',
              }}
            >
              {/* Glow interne */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />

              {/* Icône TikTok cosmique */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                {/* Anneau rotatif */}
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                  border: '1px solid rgba(168,85,247,0.4)',
                  animation: 'portal-spin 6s linear infinite',
                }} />
                <div className="absolute inset-1 rounded-full pointer-events-none" style={{
                  border: '1px solid rgba(236,72,153,0.3)',
                  animation: 'portal-spin-reverse 4s linear infinite',
                }} />
                <div className="absolute inset-0 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(8,5,26,0.9)',
                    border: '1px solid rgba(168,85,247,0.35)',
                    boxShadow: '0 0 25px rgba(124,58,237,0.3)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 relative z-10">
                {t('tiktok.title')}
              </h2>
              <p className="text-[#9580b0] max-w-xl mx-auto mb-8 relative z-10">{t('tiktok.subtitle')}</p>
              <a
                href="https://www.tiktok.com/@ricokouame"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all btn-gold relative z-10"
                style={{ boxShadow: '0 0 30px rgba(124,58,237,0.45), 0 0 60px rgba(236,72,153,0.2)' }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
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
