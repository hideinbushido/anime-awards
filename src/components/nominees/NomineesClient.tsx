'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy, Volume2, Heart, Film, Smile, Zap, Star, TrendingUp, ThumbsDown,
  GraduationCap, Globe, Palette, Users, Repeat, Coffee, Sparkles, Music,
  Mic, Headphones, Play, Square, BookOpen, Shield, Skull, Swords, Crown, X,
  type LucideIcon,
} from 'lucide-react';
import type { Category, Nominee } from '@/lib/types';

interface Props {
  category: Category | null;
  nominees: Nominee[];
  locale: string;
  voteHref: string;
  voteNowLabel: string;
  noNomineesLabel: string;
}

function getCategoryIcon(titleFr: string, titleEn: string): LucideIcon {
  const t = (titleFr + ' ' + titleEn).toLowerCase();
  if (t.includes('romance')) return Heart;
  if (t.includes('film')) return Film;
  if (t.includes('comédie') || t.includes('comedy')) return Smile;
  if (t.includes('action')) return Zap;
  if (t.includes('nouveauté') || t.includes('new series')) return Sparkles;
  if (t.includes('développement') || t.includes('development')) return TrendingUp;
  if (t.includes('déception') || t.includes('disappointment')) return ThumbsDown;
  if (t.includes('sensei')) return GraduationCap;
  if (t.includes('isekai')) return Globe;
  if (t.includes('chara') || t.includes('character design')) return Palette;
  if (t.includes('attachant') || t.includes('lovable')) return Star;
  if (t.includes('opening')) return Play;
  if (t.includes('ending')) return Square;
  if (t.includes('bande') || t.includes('soundtrack')) return Headphones;
  if (t.includes('chanson') || t.includes('song')) return Mic;
  if (t.includes('protagoniste') || t.includes('protagonist')) return Shield;
  if (t.includes('secondaire') || t.includes('supporting')) return Users;
  if (t.includes('suite') || t.includes('sequel')) return Repeat;
  if (t.includes('slice')) return Coffee;
  if (t.includes('animé de l') || t.includes('anime of the year')) return Trophy;
  if (t.includes('antagoniste') || t.includes('antagonist')) return Skull;
  if (t.includes('drama')) return BookOpen;
  if (t.includes('décors') || t.includes('settings')) return Sparkles;
  if (t.includes('seinen')) return Swords;
  if (t.includes('animation')) return Music;
  if (t.includes('masculin') || t.includes('male')) return Shield;
  if (t.includes('féminin') || t.includes('female')) return Crown;
  return Star;
}

function getCategoryAnimClass(titleFr: string, titleEn: string): string {
  const t = (titleFr + ' ' + titleEn).toLowerCase();
  if (t.includes('antagoniste') || t.includes('antagonist')) return 'anim-villain';
  if (t.includes('action') || t.includes('combat') || t.includes('film')) return 'anim-combat';
  if (t.includes('opening') || t.includes('ending') || t.includes('bande') || t.includes('chanson') || t.includes('song') || t.includes('soundtrack')) return 'anim-music';
  if (t.includes('animé de l') || t.includes('anime of the year')) return 'anim-epic';
  if (t.includes('protagoniste') || t.includes('protagonist') || t.includes('masculin') || t.includes('male') || t.includes('féminin') || t.includes('female')) return 'anim-lightning';
  if (t.includes('isekai')) return 'anim-portal';
  if (t.includes('romance')) return 'anim-romance';
  if (t.includes('attachant') || t.includes('lovable') || t.includes('comédie') || t.includes('comedy') || t.includes('slice')) return 'anim-sparkle';
  if (t.includes('sensei')) return 'anim-wisdom';
  if (t.includes('character design') || t.includes('chara')) return 'anim-rainbow';
  return 'anim-gold';
}

// ── Modal ────────────────────────────────────────────────────────────────────
function NomineeModal({ nominee, onClose }: { nominee: Nominee; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const imgSrc = nominee.imageUrl ||
    `https://placehold.co/600x800/0f0d09/c9a227?text=${encodeURIComponent(nominee.name)}`;

  return (
    <div
      className="fixed inset-0 z-[200]"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      {/* Zone de centrage sous les navbars */}
      <div
        className="absolute flex items-start sm:items-center justify-center p-4 overflow-y-auto sm:overflow-hidden"
        style={{ top: '120px', left: 0, right: 0, bottom: 0 }}
      >
      {/* Panel */}
      <div
        className="modal-panel relative rounded-2xl sm:rounded-3xl overflow-hidden flex-shrink-0"
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: 'calc(100vh - 144px)',
          border: '1px solid rgba(201,162,39,0.4)',
          boxShadow: '0 0 0 1px rgba(201,162,39,0.08), 0 40px 100px rgba(0,0,0,0.9)',
          background: '#080600',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image — natural ratio, no black bars */}
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={nominee.name}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          {/* Bottom gradient for text */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(4,3,1,0.97) 0%, rgba(4,3,1,0.5) 25%, transparent 60%)' }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 hover:scale-110"
            style={{ background: 'rgba(4,3,1,0.8)', border: '1px solid rgba(201,162,39,0.5)', backdropFilter: 'blur(8px)' }}
          >
            <X className="w-5 h-5" style={{ color: '#c9a227' }} />
          </button>

          {/* Text overlay at bottom of image */}
          <div className="absolute bottom-0 inset-x-0 px-5 pb-6">
            <div className="w-8 h-0.5 mb-3 rounded-full" style={{ background: 'linear-gradient(90deg, #c9a227, #9e7c1e)' }} />
            <h2 className="text-2xl font-black text-white leading-tight drop-shadow-lg">
              {nominee.name}
            </h2>
            {nominee.anime && (
              <p className="text-sm font-semibold mt-1" style={{ color: '#c9a227' }}>
                {nominee.anime}
              </p>
            )}
            {(nominee.descriptionFr || nominee.descriptionEn) && (
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(200,180,140,0.85)' }}>
                {nominee.descriptionFr || nominee.descriptionEn}
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function NomineesClient({
  category,
  nominees,
  locale,
  voteHref,
  voteNowLabel,
  noNomineesLabel,
}: Props) {
  const [modalNominee, setModalNominee] = useState<Nominee | null>(null);

  if (!category) return null;

  const animClass = getCategoryAnimClass(category.titleFr, category.titleEn);
  const CategoryIcon = getCategoryIcon(category.titleFr, category.titleEn);

  return (
    <div>
      {/* Category header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
          <CategoryIcon className="w-4 h-4 text-black" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {locale === 'fr' ? category.titleFr : category.titleEn}
        </h1>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,162,39,0.4), transparent)' }} />
      </div>

      {nominees.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: '#665544' }}>{noNomineesLabel}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {nominees.map((nominee, idx) => (
            <NomineeCard
              key={nominee.id}
              nominee={nominee}
              locale={locale}
              animClass={animClass}
              index={idx}
              onOpen={() => setModalNominee(nominee)}
            />
          ))}
        </div>
      )}

      {/* Vote CTA */}
      <div className="mt-16 text-center">
        <Link
          href={voteHref}
          className="inline-flex items-center gap-2 px-8 py-4 rounded font-bold text-lg transition-all btn-gold"
        >
          <Trophy className="w-5 h-5" />
          {voteNowLabel}
        </Link>
      </div>

      {/* Modal */}
      {modalNominee && (
        <NomineeModal nominee={modalNominee} onClose={() => setModalNominee(null)} />
      )}
    </div>
  );
}

function NomineeCard({
  nominee,
  locale,
  animClass,
  index,
  onOpen,
}: {
  nominee: Nominee;
  locale: string;
  animClass: string;
  index: number;
  onOpen: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [inView, setInView] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const entryDelay = `${index * 0.09}s`;
  const idleDelay = `${index * 0.09 + 0.65}s`;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!nominee.audioUrl) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(nominee.audioUrl);
        audioRef.current.volume = 0.45;
        audioRef.current.addEventListener('ended', () => setAudioPlaying(false));
        audioRef.current.addEventListener('error', () => {
          audioRef.current = null;
          setAudioPlaying(false);
        });
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
    } catch {}
  }, [nominee.audioUrl]);

  const handleMouseLeave = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioPlaying(false);
    }
  }, []);

  const descriptionText = locale === 'fr' ? nominee.descriptionFr : nominee.descriptionEn;

  return (
    <div
      ref={cardRef}
      className={`nominee-card ${animClass}${inView ? ' in-view' : ''} relative rounded-2xl overflow-hidden cursor-pointer group`}
      style={{
        background: 'rgba(15,13,9,0.95)',
        border: '1px solid rgba(201,162,39,0.18)',
        animationDelay: inView ? `${entryDelay}, ${idleDelay}` : undefined,
        ['--idle-delay' as string]: idleDelay,
      } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onOpen}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <Image
          src={
            nominee.imageUrl ||
            `https://placehold.co/300x400/0f0d09/c9a227?text=${encodeURIComponent(nominee.name)}`
          }
          alt={nominee.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-108"
          style={{ transition: 'transform 0.5s ease' }}
          unoptimized
        />
        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(8,6,0,0.98) 0%, rgba(8,6,0,0.55) 45%, rgba(8,6,0,0.15) 100%)' }}
        />

        {/* Logo événement */}
        <div className="absolute top-2 right-2 z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logonoir.png"
            alt="Anime Awards"
            style={{ width: '32px', height: '32px', objectFit: 'contain', opacity: 0.9, mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Audio indicator */}
        {audioPlaying && (
          <div
            className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(201,162,39,0.9)' }}
          >
            <Volume2 className="w-3 h-3 text-black" />
          </div>
        )}

        {/* Name overlay on image */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <h3 className="font-black text-white text-sm leading-tight line-clamp-2 drop-shadow-lg">
            {nominee.name}
          </h3>
          {nominee.anime && (
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#c9a227' }}>
              {nominee.anime}
            </p>
          )}
        </div>
      </div>

      {/* Description — visible on hover */}
      {descriptionText && (
        <div
          className="px-3 pb-3 pt-1 text-xs line-clamp-2 opacity-0 group-hover:opacity-100"
          style={{ color: '#9a8870', transition: 'opacity 0.3s ease', minHeight: '2.5rem' }}
        >
          {descriptionText}
        </div>
      )}
      {!descriptionText && <div style={{ height: '0.5rem' }} />}
    </div>
  );
}
