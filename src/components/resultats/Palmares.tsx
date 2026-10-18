'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import '@fontsource-variable/bodoni-moda/wght.css';
import '@fontsource-variable/bodoni-moda/wght-italic.css';
import './palmares.css';
import {
  PALMARES_2026,
  ANIME_DE_L_ANNEE,
  type PalmaresCategory,
  type PodiumEntry,
  type Presenter,
} from '@/data/palmares2026';

const TXT = {
  fr: {
    kicker: 'Zenkai Anime Awards 2026',
    title1: 'Le',
    title2: 'palmarès',
    lead: '25 enveloppes, 25 créateurs pour les ouvrir. Voici ce que la communauté a choisi pendant le live.',
    jump: 'Aller directement à l’animé de l’année',
    envelope: (n: number) => `Enveloppe ${n}`,
    givenBy: 'Résultats donnés par',
    first: '1er', second: '2e', third: '3e',
    replay: 'Rejouer la révélation',
    peakLead: 'Et l’animé de l’année est',
    peakKicker: 'Grand prix',
    wallTitle: 'Ils ont ouvert les enveloppes',
    wallLead: 'Merci aux créateurs qui ont donné les résultats en direct.',
    recapTitle: 'Le palmarès complet',
    closeTitle: 'Merci d’avoir voté.',
    closeLead: 'Chaque vote a compté. Rendez-vous pour l’édition 2027.',
    cta: 'Revoir le live sur TikTok',
    archives: 'Voir les archives',
    rail: 'Catégories',
  },
  en: {
    kicker: 'Zenkai Anime Awards 2026',
    title1: 'The',
    title2: 'winners',
    lead: '25 envelopes, 25 creators to open them. Here is what the community chose during the live show.',
    jump: 'Skip to Anime of the Year',
    envelope: (n: number) => `Envelope ${n}`,
    givenBy: 'Announced by',
    first: '1st', second: '2nd', third: '3rd',
    replay: 'Replay the reveal',
    peakLead: 'And the anime of the year is',
    peakKicker: 'Grand prize',
    wallTitle: 'They opened the envelopes',
    wallLead: 'Thank you to the creators who announced the results live.',
    recapTitle: 'All the winners',
    closeTitle: 'Thank you for voting.',
    closeLead: 'Every vote counted. See you for the 2027 edition.',
    cta: 'Watch the live on TikTok',
    archives: 'See the archives',
    rail: 'Categories',
  },
};
type Lang = keyof typeof TXT;

const POSTER_SIZES = '(max-width: 820px) 60vw, 320px';
const SMALL_SIZES = '(max-width: 820px) 40vw, 200px';

function Avatar({ p, size }: { p: Presenter; size: number }) {
  return (
    <span className="pm-avatar" style={{ width: size, height: size }}>
      {p.photo ? (
        <Image src={p.photo} alt="" width={size} height={size} sizes={`${size}px`} />
      ) : (
        <span className="pm-avatar__ini" aria-hidden>{p.name.charAt(0)}</span>
      )}
    </span>
  );
}

function Words({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(' ').map((w, i, arr) => (
        <span key={i}>
          <span className="pm-w"><span className="pm-w__in">{w}</span></span>
          {i < arr.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  );
}

function SmallCard({ e, place, label }: { e: PodiumEntry; place: 2 | 3; label: string }) {
  return (
    <figure className={`pm-card pm-card--${place}`} data-pm="card">
      <div className="pm-card__poster">
        <Image src={e.img} alt={`${e.name}${e.sub ? ', ' + e.sub : ''}`} fill sizes={SMALL_SIZES} quality={70} />
        <span className="pm-card__glint" aria-hidden />
      </div>
      <figcaption>
        <span className={`pm-place pm-place--${place}`}>{label}</span>
        <strong>{e.name}</strong>
        {e.sub && <em>{e.sub}</em>}
      </figcaption>
    </figure>
  );
}

function Seal({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 120 120" className="pm-seal__svg" aria-hidden>
      <defs>
        <radialGradient id={`wax${n}`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#f7dd84" />
          <stop offset=".45" stopColor="#c9a227" />
          <stop offset="1" stopColor="#6e5310" />
        </radialGradient>
      </defs>
      <path
        d="M60 4c7 0 9 6 15 8s12-2 16 4 0 12 3 17 10 6 10 13-6 9-7 15 4 12-1 17-11 2-16 6-5 11-12 12-10-6-16-6-11 6-16 2-2-11-6-16-11-6-12-13 6-9 6-15-5-11-1-16 11-1 15-6 3-12 9-15 10 2 13-2z"
        fill={`url(#wax${n})`}
      />
      <circle cx="60" cy="60" r="33" fill="none" stroke="rgba(60,40,5,.55)" strokeWidth="2" />
      <text x="60" y="71" textAnchor="middle" className="pm-seal__n">{n}</text>
    </svg>
  );
}

function Scene({ c, i, t, lang }: { c: PalmaresCategory; i: number; t: (typeof TXT)['fr']; lang: Lang }) {
  const title = lang === 'en' ? c.titleEn : c.titleFr;
  return (
    <section className="pm-scene" id={c.id} data-side={i % 2 ? 'r' : 'l'} aria-labelledby={`${c.id}-t`}>
      <div className="pm-scene__bg" aria-hidden>
        <Image src={c.bg} alt="" fill sizes="50vw" quality={35} />
      </div>
      <div className="pm-scene__scrim" aria-hidden />
      <div className="pm-scene__inner">
        <header className="pm-scene__head">
          <p className="pm-kicker" data-pm="head">{t.envelope(i + 1)}</p>
          <h2 className="pm-scene__title" id={`${c.id}-t`} data-pm="head">{title}</h2>
          <div className="pm-presenter" data-pm="head">
            <Avatar p={c.presenter} size={56} />
            <span>
              <small>{t.givenBy}</small>
              <b>{c.presenter.name}</b>
              {c.presenter.handle && <i>{c.presenter.handle}</i>}
            </span>
          </div>
          <button type="button" className="pm-replay" data-pm="replay">{t.replay}</button>
        </header>

        <div className="pm-podium">
          {c.second && <SmallCard e={c.second} place={2} label={t.second} />}
          <figure className="pm-win" data-pm="win">
            <div className="pm-win__frame">
              <div className="pm-win__poster" data-pm="poster">
                <Image src={c.winner.img} alt={`${c.winner.name}${c.winner.sub ? ', ' + c.winner.sub : ''}`} fill sizes={POSTER_SIZES} quality={78} />
              </div>
              <div className="pm-win__cover" aria-hidden>
                <span className="pm-win__flap pm-win__flap--l" data-pm="flapL" />
                <span className="pm-win__flap pm-win__flap--r" data-pm="flapR" />
                <span className="pm-seal pm-seal--l" data-pm="sealL"><Seal n={i + 1} /></span>
                <span className="pm-seal pm-seal--r" data-pm="sealR"><Seal n={i + 1} /></span>
              </div>
              <span className="pm-win__flash" data-pm="flash" aria-hidden />
            </div>
            <figcaption data-pm="cap">
              <span className="pm-place pm-place--1">{t.first}</span>
              <Words text={c.winner.name} className="pm-win__name" />
              {c.winner.sub && <em>{c.winner.sub}</em>}
              {c.winner.credit && <small>{c.winner.credit}</small>}
            </figcaption>
          </figure>
          {c.third && <SmallCard e={c.third} place={3} label={t.third} />}
        </div>
      </div>
    </section>
  );
}

export default function Palmares({ locale }: { locale: string }) {
  const lang: Lang = locale === 'en' ? 'en' : 'fr';
  const t = TXT[lang];
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const lenisRef = useRef<Lenis | null>(null);
  const all = [...PALMARES_2026, ANIME_DE_L_ANNEE];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.classList.add(reduced ? 'pm-static' : 'pm-js');

    let lenis: Lenis | null = null;
    let raf: ((time: number) => void) | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
      lenisRef.current = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      raf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ---------- Hero : plans à vitesses différentes ---------- */
      if (!reduced) {
        const hero = el.querySelector('.pm-hero') as HTMLElement;
        const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
        tl.to(hero.querySelector('.pm-hero__bg'), { yPercent: 18, scale: 1.08, ease: 'none' }, 0)
          .to(hero.querySelector('.pm-hero__p--c'), { yPercent: -12, ease: 'none' }, 0)
          .to(hero.querySelector('.pm-hero__p--l'), { yPercent: -45, rotate: -14, ease: 'none' }, 0)
          .to(hero.querySelector('.pm-hero__p--r'), { yPercent: -60, rotate: 13, ease: 'none' }, 0)
          .to(hero.querySelector('.pm-hero__copy'), { yPercent: 30, opacity: 0.15, ease: 'none' }, 0)
          .to(hero.querySelector('.pm-hero__dust'), { yPercent: -70, ease: 'none' }, 0);

        // entrée du hero
        gsap.from(hero.querySelectorAll('.pm-hero__p'), { y: 120, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.1 });
        gsap.from(hero.querySelectorAll('.pm-hero__copy > *'), { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.35 });

        // léger suivi du pointeur (ordinateur seulement)
        mm.add('(pointer: fine)', () => {
          const move = (e: PointerEvent) => {
            const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
            gsap.to(hero.querySelector('.pm-hero__posters'), { x: x * 26, y: y * 14, duration: 1.2, ease: 'power3.out' });
            gsap.to(hero.querySelector('.pm-hero__dust'), { x: x * -40, duration: 1.4, ease: 'power3.out' });
          };
          hero.addEventListener('pointermove', move);
          return () => hero.removeEventListener('pointermove', move);
        });
      }

      /* ---------- Scènes : le sceau ---------- */
      const scenes = gsap.utils.toArray<HTMLElement>('.pm-scene');
      scenes.forEach((s, i) => {
        ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 45%', onToggle: (self) => { if (self.isActive) setActive(i); } });
        const q = (k: string) => s.querySelectorAll(`[data-pm="${k}"]`);
        const order = [s.querySelector('.pm-card--3'), s.querySelector('.pm-card--2')].filter(Boolean) as HTMLElement[];
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' }, onComplete: () => s.classList.add('is-done') });
        tl.fromTo(q('head'), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, 0);
        order.forEach((c, k) => {
          tl.fromTo(c, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.25 + k * 0.32)
            .fromTo(c.querySelector('.pm-card__glint'), { xPercent: -120 }, { xPercent: 120, duration: 0.9, ease: 'power2.inOut' }, 0.45 + k * 0.32);
        });
        const at = 0.95;
        tl.fromTo(q('win'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, at - 0.35)
          .to([q('sealL'), q('sealR')], { scale: 1.12, duration: 0.28, ease: 'back.out(3)' }, at)
          .to(q('sealL'), { xPercent: -95, rotate: -24, opacity: 0, duration: 0.7, ease: 'power3.in' }, at + 0.3)
          .to(q('sealR'), { xPercent: 95, rotate: 24, opacity: 0, duration: 0.7, ease: 'power3.in' }, at + 0.3)
          .to(q('flapL'), { xPercent: -102, duration: 0.85, ease: 'power4.inOut' }, at + 0.42)
          .to(q('flapR'), { xPercent: 102, duration: 0.85, ease: 'power4.inOut' }, at + 0.42)
          .fromTo(q('flash'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.4, duration: 0.25, ease: 'power2.out' }, at + 0.55)
          .to(q('flash'), { opacity: 0, duration: 0.7, ease: 'power2.out' }, at + 0.8)
          .fromTo(q('poster'), { scale: 1.12, filter: 'brightness(1.8)' }, { scale: 1, filter: 'brightness(1)', duration: 1.2 }, at + 0.55)
          .fromTo(s.querySelectorAll('.pm-win figcaption .pm-place, .pm-win figcaption em, .pm-win figcaption small'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 }, at + 0.95)
          .fromTo(s.querySelectorAll('.pm-win__name .pm-w__in'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.06 }, at + 0.9);

        if (reduced) { tl.progress(1); s.classList.add('is-done'); return; }
        ScrollTrigger.create({ trigger: s, start: 'top 58%', once: true, onEnter: () => tl.play() });
        const btn = s.querySelector('[data-pm="replay"]');
        btn?.addEventListener('click', () => { s.classList.remove('is-done'); tl.restart(); });
        // fond : dérive lente
        gsap.fromTo(s.querySelector('.pm-scene__bg'), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      /* ---------- Pic : animé de l'année ---------- */
      const peak = el.querySelector('.pm-peak') as HTMLElement;
      ScrollTrigger.create({ trigger: peak, start: 'top 55%', end: 'bottom 45%', onToggle: (self) => { if (self.isActive) setActive(PALMARES_2026.length); } });
      if (!reduced) {
        let burst = false;
        const pt = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: peak, start: 'top top', end: 'bottom bottom', scrub: 0.6,
            onUpdate: (self) => { if (!burst && self.progress > 0.72) { burst = true; confetti(peak.querySelector('canvas') as HTMLCanvasElement); } },
          },
        });
        pt.fromTo('.pm-peak__lead', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08 }, 0.02)
          .to('.pm-peak__lead', { opacity: 0, y: -30, duration: 0.08 }, 0.2)
          .fromTo('.pm-peak__pillar', { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.2 }, 0.12)
          .fromTo('.pm-peak__bg', { opacity: 0, scale: 1.15 }, { opacity: 0.55, scale: 1, duration: 0.35 }, 0.15)
          .fromTo('.pm-peak__poster', { yPercent: 60, scale: 0.72, opacity: 0, filter: 'brightness(2.2)' }, { yPercent: 0, scale: 1, opacity: 1, filter: 'brightness(1)', duration: 0.3, ease: 'power2.out' }, 0.26)
          .fromTo('.pm-peak__frame', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.16, ease: 'power2.out' }, 0.5)
          .fromTo('.pm-peak__kicker', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.08 }, 0.55)
          .fromTo('.pm-peak__name .pm-w__in', { yPercent: 115 }, { yPercent: 0, duration: 0.14, stagger: 0.025, ease: 'power3.out' }, 0.58)
          .fromTo('.pm-peak__meta > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.1, stagger: 0.03 }, 0.72)
          .to({}, { duration: 0.12 });
      }

      /* ---------- Mur, récap, fin ---------- */
      if (!reduced) {
        gsap.utils.toArray<HTMLElement>('.pm-reveal').forEach((n) => {
          gsap.from(n.children, { y: 34, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.04, scrollTrigger: { trigger: n, start: 'top 82%', once: true } });
        });
      }
    }, el);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const tmo = setTimeout(refresh, 1200);
    return () => {
      clearTimeout(tmo);
      window.removeEventListener('load', refresh);
      ctx.revert();
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  // garder la puce active visible dans la barre
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current; if (!rail || active < 0) return;
    const chip = rail.querySelector<HTMLElement>(`[data-i="${active}"]`);
    if (chip) rail.scrollTo({ left: chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(id); if (!target) return;
    if (lenisRef.current) lenisRef.current.scrollTo(target, { offset: -110, duration: 1.4 });
    else target.scrollIntoView({ behavior: 'auto' });
  };

  const peakTitle = lang === 'en' ? ANIME_DE_L_ANNEE.titleEn : ANIME_DE_L_ANNEE.titleFr;

  return (
    <div className="pm" ref={root}>
      {/* ---------- HERO ---------- */}
      <section className="pm-hero" aria-labelledby="pm-h1">
        <div className="pm-hero__bg" aria-hidden>
          <Image src="/FOND_ANIME.png" alt="" fill priority sizes="100vw" quality={55} />
        </div>
        <div className="pm-hero__veil" aria-hidden />
        <div className="pm-hero__posters" aria-hidden>
          <div className="pm-hero__p pm-hero__p--c"><Image src="/image/ANNEE/MHA.png" alt="" fill priority sizes="(max-width: 820px) 46vw, 300px" quality={70} /></div>
          <div className="pm-hero__p pm-hero__p--l"><Image src="/image/FILM/Demon.png" alt="" fill priority sizes="(max-width: 820px) 34vw, 240px" quality={70} /></div>
          <div className="pm-hero__p pm-hero__p--r"><Image src="/image/SLICE/Spy.png" alt="" fill priority sizes="(max-width: 820px) 34vw, 240px" quality={70} /></div>
        </div>
        <div className="pm-hero__copy">
          <p className="pm-kicker">{t.kicker}</p>
          <h1 id="pm-h1" className="pm-hero__title"><span>{t.title1}</span> {t.title2}</h1>
          <p className="pm-hero__lead">{t.lead}</p>
          <a className="pm-link" href={`#${ANIME_DE_L_ANNEE.id}`} onClick={go(ANIME_DE_L_ANNEE.id)}>{t.jump}</a>
        </div>
        <div className="pm-hero__dust" aria-hidden />
      </section>

      {/* ---------- BARRE DES CATÉGORIES ---------- */}
      <nav className="pm-rail" aria-label={t.rail}>
        <div className="pm-rail__track" ref={railRef}>
          {all.map((c, i) => (
            <a key={c.id} href={`#${c.id}`} data-i={i} onClick={go(c.id)} className={i === active ? 'is-on' : ''} aria-current={i === active ? 'true' : undefined}>
              {lang === 'en' ? c.titleEn : c.titleFr}
            </a>
          ))}
        </div>
      </nav>

      {/* ---------- 24 ENVELOPPES ---------- */}
      {PALMARES_2026.map((c, i) => <Scene key={c.id} c={c} i={i} t={t} lang={lang} />)}

      {/* ---------- LE PIC ---------- */}
      <section className="pm-peak" id={ANIME_DE_L_ANNEE.id} aria-labelledby="pm-peak-t">
        <div className="pm-peak__stage">
          <div className="pm-peak__bg" aria-hidden>
            <Image src={ANIME_DE_L_ANNEE.bg} alt="" fill sizes="100vw" quality={50} />
          </div>
          <div className="pm-peak__pillar" aria-hidden />
          <p className="pm-peak__lead" aria-hidden>{t.peakLead}…</p>
          <div className="pm-peak__grid">
            <div className="pm-peak__poster">
              <Image src={ANIME_DE_L_ANNEE.winner.img} alt={`${ANIME_DE_L_ANNEE.winner.name}, ${ANIME_DE_L_ANNEE.winner.sub}`} fill sizes="(max-width: 820px) 62vw, 380px" quality={82} />
              <svg className="pm-peak__frame" viewBox="0 0 100 178" preserveAspectRatio="none" aria-hidden>
                <path d="M8 1H92L99 8V170L92 177H8L1 170V8Z" />
              </svg>
            </div>
            <div className="pm-peak__text">
              <p className="pm-peak__kicker">{t.peakKicker} · {peakTitle}</p>
              <h2 id="pm-peak-t" className="pm-peak__name"><Words text={ANIME_DE_L_ANNEE.winner.name} /></h2>
              <div className="pm-peak__meta">
                <em>{ANIME_DE_L_ANNEE.winner.sub}</em>
                <small>{ANIME_DE_L_ANNEE.winner.credit}</small>
                <div className="pm-presenter">
                  <Avatar p={ANIME_DE_L_ANNEE.presenter} size={52} />
                  <span><small>{t.givenBy}</small><b>{ANIME_DE_L_ANNEE.presenter.name}</b>{ANIME_DE_L_ANNEE.presenter.handle && <i>{ANIME_DE_L_ANNEE.presenter.handle}</i>}</span>
                </div>
              </div>
            </div>
          </div>
          <canvas className="pm-peak__confetti" aria-hidden />
        </div>
      </section>

      {/* ---------- MUR DES PRÉSENTATEURS ---------- */}
      <section className="pm-wall" aria-labelledby="pm-wall-t">
        <div className="pm-wall__head pm-reveal">
          <h2 id="pm-wall-t">{t.wallTitle}</h2>
          <p>{t.wallLead}</p>
        </div>
        <ul className="pm-wall__grid pm-reveal">
          {all.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} onClick={go(c.id)}>
                <Avatar p={c.presenter} size={72} />
                <b>{c.presenter.name}</b>
                <span>{lang === 'en' ? c.titleEn : c.titleFr}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- RÉCAP ---------- */}
      <section className="pm-recap" aria-labelledby="pm-recap-t">
        <h2 id="pm-recap-t" className="pm-reveal"><span>{t.recapTitle}</span></h2>
        <ol className="pm-recap__list pm-reveal">
          {all.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} onClick={go(c.id)}>
                <span className="pm-recap__thumb"><Image src={c.winner.img} alt="" fill sizes="56px" quality={60} /></span>
                <span className="pm-recap__cat">{lang === 'en' ? c.titleEn : c.titleFr}</span>
                <span className="pm-recap__win">{c.winner.name}{c.winner.sub ? <em> · {c.winner.sub}</em> : null}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- FIN ---------- */}
      <section className="pm-close" aria-labelledby="pm-close-t">
        <div className="pm-reveal">
          <h2 id="pm-close-t">{t.closeTitle}</h2>
          <p>{t.closeLead}</p>
          <div className="pm-close__ctas">
            <a className="pm-btn" href="https://www.tiktok.com/@ricokouame" target="_blank" rel="noopener noreferrer">{t.cta}</a>
            <Link className="pm-link" href={`/${locale}/archives`}>{t.archives}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Confettis dorés, une seule salve, dessinés sur un canvas (léger, sans dépendance). */
function confetti(cv: HTMLCanvasElement | null) {
  if (!cv) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth, h = cv.clientHeight;
  cv.width = w * dpr; cv.height = h * dpr;
  const g = cv.getContext('2d'); if (!g) return;
  g.scale(dpr, dpr);
  const cols = ['#f7dd84', '#c9a227', '#fff3cc', '#9e7c1e', '#e8c54a'];
  const N = w < 700 ? 90 : 170;
  const ps = Array.from({ length: N }, () => ({
    x: w / 2 + (Math.random() - 0.5) * w * 0.2, y: h * 0.55,
    vx: (Math.random() - 0.5) * 14, vy: -6 - Math.random() * 13,
    r: 3 + Math.random() * 5, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.3,
    c: cols[(Math.random() * cols.length) | 0],
  }));
  const t0 = performance.now();
  const step = (now: number) => {
    const el = (now - t0) / 1000;
    g.clearRect(0, 0, w, h);
    for (const p of ps) {
      p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.globalAlpha = Math.max(0, 1 - el / 3.2);
      g.fillStyle = p.c; g.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8); g.restore();
    }
    if (el < 3.2) requestAnimationFrame(step); else g.clearRect(0, 0, w, h);
  };
  requestAnimationFrame(step);
}
