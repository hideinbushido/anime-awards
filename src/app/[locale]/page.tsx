import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Play, ChevronRight, Star, Tv } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import AnimateOnScroll from '@/components/home/AnimateOnScroll';
import CommentsSection from '@/components/home/CommentsSection';
import { getActiveEvent, getCategories } from '@/lib/firestore';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('home');

  let event = null;

  try {
    event = await getActiveEvent();
    if (event) await getCategories(event.id);
  } catch {
    // Firebase not configured yet
  }

  return (
    <>
      <Navbar />
      <main>

        {/* ════════════════════════════════════════════════════════════
            SECTION 1 — HERO Award Show
        ════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden" style={{ background: '#080600' }}>

          {/* ── FOND VIDÉO HERO — change le nom du fichier ici ── */}
          <video autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 1.00 }}
          >
            <source src="/Gold_fond.mp4" type="video/mp4" />
          </video>

          {/* Overlay assombri */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(8,6,0,0.75) 0%, rgba(8,6,0,0.25) 45%, rgba(8,6,0,0.92) 100%)' }}
          />

          {/* Projecteur or central haut */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 55% 50% at 50% 0%, rgba(201,162,39,0.22) 0%, transparent 70%)' }}
          />
          {/* Projecteur latéral gauche */}
          <div className="absolute top-0 left-0 w-[600px] h-[700px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 40% 60% at 0% 0%, rgba(232,197,74,0.1) 0%, transparent 65%)' }}
          />
          {/* Projecteur latéral droit */}
          <div className="absolute top-0 right-0 w-[600px] h-[700px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 40% 60% at 100% 0%, rgba(201,162,39,0.08) 0%, transparent 65%)' }}
          />
          {/* Reflet chaud bas-scène */}
          <div className="absolute bottom-0 inset-x-0 h-64 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(120,60,10,0.15) 0%, transparent 70%)' }}
          />

          {/* Lignes décoratives style scène */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-[800px] h-[800px] rounded-full" style={{ border: '1px solid rgba(201,162,39,0.08)' }} />
            <div className="absolute w-[580px] h-[580px] rounded-full" style={{ border: '1px solid rgba(201,162,39,0.06)' }} />
          </div>

          <div className="container-mobile text-center z-10 py-20">


            {/* Titre */}
            <AnimateOnScroll animation="cosmic" delay={350} duration={900}>
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-4 leading-none tracking-tight">
                <span style={{
                  background: 'linear-gradient(135deg, #e8c54a, #c9a227, #f5e090, #c9a227)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient-shift 6s ease infinite',
                }}>Anime</span>
                <br />
                <span className="text-white" style={{ textShadow: '0 0 60px rgba(201,162,39,0.4), 0 0 120px rgba(201,162,39,0.15)' }}>Awards</span>
              </h1>
            </AnimateOnScroll>

            {/* Ligne décorative prestige */}
            <AnimateOnScroll animation="fade-up" delay={600}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, #c9a227)' }} />
                <p className="text-lg sm:text-xl font-bold tracking-[0.35em] uppercase"
                  style={{ color: '#c9a227', textShadow: '0 0 15px rgba(201,162,39,0.5)' }}
                >
                  {t('hero.edition')}
                </p>
                <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, #c9a227)' }} />
              </div>
              <p className="text-base sm:text-lg max-w-2xl mx-auto mb-12" style={{ color: '#9a8870' }}>
                {t('hero.slogan')}
              </p>
            </AnimateOnScroll>

            {/* CTA */}
            <AnimateOnScroll animation="fade-up" delay={800}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                  href={`/${locale}/vote`}
                  className="group flex items-center gap-2 px-8 py-4 rounded text-black font-bold text-lg transition-all btn-gold"
                  style={{ boxShadow: '0 0 30px rgba(201,162,39,0.4), 0 0 70px rgba(201,162,39,0.15)', animation: 'pulse-neon 2.5s ease-in-out infinite' }}
                >
                  <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Voter maintenant
                </Link>
                <Link
                  href={`/${locale}/categories`}
                  className="flex items-center gap-2 px-8 py-4 rounded font-semibold text-lg transition-all"
                  style={{ border: '1px solid rgba(201,162,39,0.35)', color: '#c9a227', backdropFilter: 'blur(10px)' }}
                >
                  Voir les Catégories
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </AnimateOnScroll>

          </div>

          {/* Fondu bas */}
          <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #080600)' }}
          />
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 2 — HOW IT WORKS
        ════════════════════════════════════════════════════════════ */}
        <section className="relative py-20 overflow-hidden" style={{
          borderTop: '1px solid rgba(201,162,39,0.12)',
          background: 'linear-gradient(160deg, #0e0b05 0%, #080600 40%, #110d04 70%, #080600 100%)',
        }}>
          {/* Projecteur haut-gauche */}
          <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top left, rgba(201,162,39,0.1) 0%, transparent 65%)' }} />
          {/* Projecteur bas-droit */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at bottom right, rgba(201,162,39,0.07) 0%, transparent 65%)' }} />
          {/* Particules or */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:`
            radial-gradient(1px 1px at 18% 22%, rgba(232,197,74,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 15%, rgba(201,162,39,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 82% 45%, rgba(245,224,144,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 75%, rgba(232,197,74,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 80%, rgba(201,162,39,0.3) 0%, transparent 100%)
          `}} />

          <div className="container-mobile relative z-10">

            {/* Titre */}
            <AnimateOnScroll animation="fade-down" threshold={0.2}>
              <div className="text-center mb-14">
                <h2 className="text-3xl sm:text-4xl font-black mb-4">
                  <span style={{
                    background: 'linear-gradient(135deg, #e8c54a, #c9a227)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>{t('howItWorks.title')}</span>
                </h2>
                <div className="gold-divider w-40 mx-auto" />
              </div>
            </AnimateOnScroll>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Tv,     title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc'), step: '01', href: `/${locale}/nominees`, gold: '#c9a227' },
                { icon: Trophy, title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc'), step: '02', href: `/${locale}/vote`,      gold: '#e8c54a' },
                { icon: Play,   title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc'), step: '03', href: event?.tiktokUrl || '#', gold: '#f5e090' },
              ].map((item, i) => (
                <AnimateOnScroll key={i} animation="fade-up" delay={i * 160} threshold={0.1}>
                  <Link href={item.href}
                    className="group rounded-xl p-8 card-glow text-center relative overflow-hidden block"
                    style={{ background: 'rgba(15,13,9,0.8)', border: '1px solid rgba(201,162,39,0.15)', backdropFilter: 'blur(12px)' }}
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                      style={{ background: `radial-gradient(ellipse at center, rgba(201,162,39,0.05) 0%, transparent 70%)` }} />
                    {/* Numéro décor */}
                    <div className="text-6xl font-black mb-4 relative z-10" style={{ color: 'rgba(201,162,39,0.07)' }}>{item.step}</div>
                    {/* Icône */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform relative z-10"
                      style={{ background: `linear-gradient(135deg, ${item.gold}, #9e7c1e)`, boxShadow: `0 0 25px rgba(201,162,39,0.25)` }}
                    >
                      <item.icon className="w-7 h-7 text-black" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">{item.title}</h3>
                    <p className="text-sm relative z-10" style={{ color: '#9a8870' }}>{item.desc}</p>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 3 — ANIMATEURS DU LIVE
        ════════════════════════════════════════════════════════════ */}
        <section className="relative py-24 overflow-hidden" style={{ background: '#080600', borderTop: '1px solid rgba(201,162,39,0.12)' }}>

          {/* ── FOND VIDÉO SECTION 3 — change uniquement le nom du fichier ── */}
          <video autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.75 }}
          >
            <source src="/Fond/section.mp4" type="video/mp4" />
          </video>

          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(8,6,0,0.9) 0%, rgba(14,11,5,0.8) 50%, rgba(8,6,0,0.88) 100%)' }} />
          {/* Projecteur doré haut */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 0%, rgba(201,162,39,0.15) 0%, transparent 65%)' }} />
          {/* Chaleur bas */}
          <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #080600)' }} />

          <div className="container-mobile relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* GAUCHE — Cadres photos */}
              <AnimateOnScroll animation="fade-left" threshold={0.15}
                className="flex-shrink-0 flex flex-col sm:flex-row gap-8 items-center justify-center"
              >
                {/* Cadre 1 — Braizanime */}
                <div className="group relative flex flex-col items-center gap-4">
                  <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105"
                    style={{ border: '1px solid rgba(201,162,39,0.4)', boxShadow: '0 0 0 1px rgba(201,162,39,0.1), 0 20px 50px rgba(201,162,39,0.12)' }}
                  >
                    <Image src="/image/team/Braizanime.jpeg" alt="Braizanime" width={256} height={320} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(201,162,39,0.6)' }}>Marlene</p>
                    <p className="text-white font-bold">Braizanime</p>
                    <p className="text-sm" style={{ color: 'rgba(201,162,39,0.5)' }}>Animatrice</p>
                  </div>
                </div>

                {/* Cadre 2 — Tampico */}
                <div className="group relative flex flex-col items-center gap-4">
                  <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105"
                    style={{ border: '1px solid rgba(232,197,74,0.35)', boxShadow: '0 0 0 1px rgba(232,197,74,0.1), 0 20px 50px rgba(232,197,74,0.1)' }}
                  >
                    <Image src="/image/team/Pape.jpeg" alt="Tampico" width={256} height={320} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(232,197,74,0.6)' }}>Pape</p>
                    <p className="text-white font-bold">Tampico</p>
                    <p className="text-sm" style={{ color: 'rgba(232,197,74,0.5)' }}>Animateur</p>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* DROITE — Texte */}
              <AnimateOnScroll animation="fade-right" delay={200} threshold={0.15}
                className="flex-1 text-center lg:text-right lg:pl-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
                  style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', boxShadow: '0 0 15px rgba(201,162,39,0.12)', backdropFilter: 'blur(8px)', borderRadius: '4px' }}
                >
                  <Star className="w-3 h-3" />
                  ✦ Présentation ✦
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                  Les Animateurs<br />
                  <span style={{ background: 'linear-gradient(135deg, #e8c54a, #c9a227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    du LIVE
                  </span>
                </h2>
                <div className="h-px w-20 mx-auto lg:ml-auto lg:mr-0 mb-6 opacity-60"
                  style={{ background: 'linear-gradient(90deg, transparent, #c9a227, #e8c54a)' }} />
                <p className="text-base max-w-sm mx-auto lg:ml-auto lg:mr-0 mb-8 leading-relaxed" style={{ color: '#9a8870' }}>
                  Découvrez qui animera la cérémonie officielle en direct sur TikTok.
                </p>
                <a href="https://www.tiktok.com/@ricokouame" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold transition-all btn-gold lg:float-right"
                  style={{ boxShadow: '0 0 30px rgba(201,162,39,0.4)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z" /></svg>
                  Suivre le Live
                </a>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 4 — COMMENTAIRES
        ════════════════════════════════════════════════════════════ */}
        <CommentsSection locale={locale} />

      </main>
      <Footer />
    </>
  );
}
