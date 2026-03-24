'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  CheckCircle, ChevronLeft, ChevronRight, Trophy, User, AtSign, Mail,
  Star, X, Volume2, Loader2, Send,
} from 'lucide-react';
import type { Category, Nominee } from '@/lib/types';

type Step = 'confirm' | 'identity' | 'categories' | 'nominees' | 'email_sent' | 'success';

interface Props {
  categories: Category[];
  nomineesByCategory: Record<string, Nominee[]>;
  eventId: string;
  locale: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function VoteFlow({ categories, nomineesByCategory, eventId, locale }: Props) {
  const [step, setStep] = useState<Step>('confirm');
  const [voterName, setVoterName] = useState('');
  const [voterTiktok, setVoterTiktok] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
  const [confirmNominee, setConfirmNominee] = useState<Nominee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isTouch, setIsTouch] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setPlayingId(null);
  }, []);

  const playAudio = useCallback((nominee: Nominee) => {
    if (!(nominee as any).audioUrl) return;
    stopAudio();
    const audio = new Audio((nominee as any).audioUrl);
    audio.volume = 0.5;
    audioRef.current = audio;
    audio.play().catch(() => {});
    setPlayingId(nominee.id);
  }, [stopAudio]);

  // p-annee always last
  const orderedCats = [...categories].sort((a, b) => {
    if (a.id === 'p-annee') return 1;
    if (b.id === 'p-annee') return -1;
    return 0;
  });

  const total = orderedCats.length;
  const votedCount = Object.keys(votes).length;

  // Card size based on device
  const cardW = isTouch ? 160 : 220;
  const cardH = isTouch ? 240 : 330;

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -(cardW + 16), behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: cardW + 16, behavior: 'smooth' });

  // Record a vote for a category, submit when all done
  const handleVoteConfirmed = async (nominee: Nominee) => {
    stopAudio();
    const newVotes = { ...votes, [nominee.categoryId]: nominee.id };
    setVotes(newVotes);
    setConfirmNominee(null);
    setSelectedNominee(null);

    if (Object.keys(newVotes).length === total) {
      // All voted — go to email step
      setStep('email_sent');
    } else {
      setStep('categories');
      setActiveCat(null);
    }
  };

  // Final submission — called from email_sent step
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const answers = Object.entries(votes).map(([categoryId, nomineeId]) => ({ categoryId, nomineeId }));
      const res = await fetch('/api/vote/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          voterName: voterName.trim(),
          voterTiktok: voterTiktok.trim() || undefined,
          voterEmail: voterEmail.trim(),
          answers,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Erreur lors de la soumission.');
        setSubmitting(false);
        return;
      }
      // If no email service configured, direct confirm URL returned
      if (data.confirmUrl) {
        window.location.href = data.confirmUrl;
        return;
      }
      setStep('success');
    } catch {
      setSubmitError('Erreur réseau.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── CONFIRM ────────────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl p-8 text-center"
          style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.25)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
            <Trophy className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Phase de Vote</h2>
          <p className="mb-2" style={{ color: '#9a8870' }}>
            Vous êtes sur le point de commencer votre phase de vote.
          </p>
          <p className="text-sm mb-8" style={{ color: '#665544' }}>
            Vous voterez pour chaque catégorie une par une.<br />
            Un email de confirmation vous sera envoyé pour valider vos votes.
          </p>
          <div className="flex gap-3">
            <a href={`/${locale}`}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-center transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#9a8870', border: '1px solid rgba(255,255,255,0.08)' }}>
              Pas encore
            </a>
            <button onClick={() => setStep('identity')}
              className="flex-1 py-3 rounded-xl font-black text-sm text-black transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
              Je suis prêt →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── IDENTITY ───────────────────────────────────────────────────────────────
  if (step === 'identity') {
    const emailValid = validateEmail(voterEmail);
    const nameValid = voterName.trim().length >= 2;
    const canProceed = nameValid && emailValid;

    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl p-8"
          style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.2)' }}>
          <h2 className="text-2xl font-black text-white mb-1 text-center">Qui êtes-vous ?</h2>
          <p className="text-center text-sm mb-8" style={{ color: '#9a8870' }}>
            Ces informations permettent de valider et sécuriser votre vote
          </p>
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-bold mb-2 block" style={{ color: '#c9a227' }}>
                Prénom ou surnom <span style={{ color: '#ff6644' }}>*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#665544' }} />
                <input type="text" value={voterName} onChange={e => setVoterName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-[#4a3a2a] outline-none transition-all"
                  style={{ background: '#0a0800', border: `1px solid ${nameValid ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.07)'}` }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-bold mb-2 block" style={{ color: '#c9a227' }}>
                Adresse email <span style={{ color: '#ff6644' }}>*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#665544' }} />
                <input type="email" value={voterEmail} onChange={e => setVoterEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-[#4a3a2a] outline-none transition-all"
                  style={{ background: '#0a0800', border: `1px solid ${voterEmail && emailValid ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.07)'}` }} />
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#4a3a2a' }}>
                Un lien de confirmation vous sera envoyé pour valider votre vote
              </p>
            </div>

            {/* TikTok (optional) */}
            <div>
              <label className="text-sm font-bold mb-2 block" style={{ color: '#665544' }}>
                Pseudo TikTok <span className="font-normal text-xs">(facultatif)</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#665544' }} />
                <input type="text" value={voterTiktok} onChange={e => setVoterTiktok(e.target.value)}
                  placeholder="@votre_pseudo"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-[#4a3a2a] outline-none"
                  style={{ background: '#0a0800', border: '1px solid rgba(255,255,255,0.07)' }} />
              </div>
            </div>
          </div>

          <button onClick={() => canProceed && setStep('categories')} disabled={!canProceed}
            className="w-full mt-7 py-4 rounded-xl font-black text-base transition-all"
            style={{
              background: canProceed ? 'linear-gradient(135deg, #c9a227, #9e7c1e)' : 'rgba(201,162,39,0.15)',
              color: canProceed ? '#000' : '#665544',
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}>
            Commencer à voter →
          </button>
        </div>
      </div>
    );
  }

  // ── CATEGORIES ─────────────────────────────────────────────────────────────
  if (step === 'categories') {
    return (
      <div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold" style={{ color: '#9a8870' }}>Progression</span>
            <span className="text-sm font-black" style={{ color: '#c9a227' }}>{votedCount} / {total}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(201,162,39,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(votedCount / total) * 100}%`, background: 'linear-gradient(90deg, #c9a227, #9e7c1e)' }} />
          </div>
        </div>
        <h2 className="text-xl font-black text-white mb-6">
          {votedCount === 0 ? 'Choisissez une catégorie pour commencer'
            : votedCount < total ? 'Continuez — choisissez la prochaine catégorie'
            : 'Finalisation...'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedCats.map((cat) => {
            const nomineeId = votes[cat.id];
            const nominee = nomineeId ? nomineesByCategory[cat.id]?.find(n => n.id === nomineeId) : null;
            const voted = !!nomineeId;
            return (
              <button key={cat.id}
                onClick={() => { if (!voted) { stopAudio(); setActiveCat(cat); setSelectedNominee(null); setStep('nominees'); } }}
                disabled={voted}
                className="relative rounded-2xl overflow-hidden text-left group transition-all duration-200"
                style={{ height: '100px', border: voted ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.07)', background: voted ? 'rgba(201,162,39,0.04)' : '#111108', cursor: voted ? 'default' : 'pointer' }}>
                {!voted && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl"
                    style={{ border: '1px solid rgba(201,162,39,0.3)', background: 'rgba(201,162,39,0.02)' }} />
                )}
                <div className="flex items-center gap-4 p-4 h-full">
                  {voted
                    ? <CheckCircle className="w-7 h-7 flex-shrink-0" style={{ color: '#c9a227' }} />
                    : <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.15)' }}>
                        <Star className="w-3.5 h-3.5" style={{ color: '#c9a227' }} />
                      </div>}
                  <div className="min-w-0">
                    <p className="font-black truncate text-sm" style={{ color: voted ? '#c9a227' : 'white' }}>{cat.titleFr}</p>
                    {voted && nominee
                      ? <p className="text-white text-xs truncate mt-0.5 font-semibold">{nominee.name}</p>
                      : <p className="text-xs mt-0.5 group-hover:text-[#c9a227] transition-colors" style={{ color: '#4a3a2a' }}>Voter →</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── NOMINEES ───────────────────────────────────────────────────────────────
  if (step === 'nominees' && activeCat) {
    const catNominees = (nomineesByCategory[activeCat.id] ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

    const catTitle = (activeCat.titleFr + ' ' + (activeCat.titleEn ?? '')).toLowerCase();
    const isAudioCat = catTitle.includes('opening') || catTitle.includes('ending') || catTitle.includes('chanson');

    return (
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { stopAudio(); setStep('categories'); setSelectedNominee(null); setConfirmNominee(null); }}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all hover:text-white flex-shrink-0"
            style={{ color: '#9a8870', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <ChevronLeft className="w-4 h-4" /> Retour
          </button>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-white leading-tight truncate">{activeCat.titleFr}</h2>
            <p className="text-xs" style={{ color: '#665544' }}>
              {isAudioCat
                ? isTouch ? 'Touche pour écouter, re-touche pour voter' : 'Survole pour écouter — clique pour voter'
                : 'Clique sur un nominé pour voter'}
            </p>
          </div>
        </div>

        {/* Vitrine + scroll arrows */}
        <div className="relative">
          {/* Left arrow */}
          {!isTouch && (
            <button onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:brightness-125"
              style={{ background: 'rgba(8,6,0,0.85)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', backdropFilter: 'blur(4px)' }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right arrow */}
          {!isTouch && (
            <button onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:brightness-125"
              style={{ background: 'rgba(8,6,0,0.85)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', backdropFilter: 'blur(4px)' }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Cards scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-4 pb-3"
            style={{
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              paddingLeft: isTouch ? '0' : '44px',
              paddingRight: isTouch ? '0' : '44px',
            }}>
            {catNominees.map((nominee) => {
              const isPlaying = playingId === nominee.id;
              const hasAudio = !!(nominee as any).audioUrl;

              return (
                <div
                  key={nominee.id}
                  className="relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer group"
                  style={{
                    width: `${cardW}px`,
                    height: `${cardH}px`,
                    scrollSnapAlign: 'start',
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: '#111108',
                    transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,162,39,0.4)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(201,162,39,0.15)';
                    if (isAudioCat && !isTouch && hasAudio) playAudio(nominee);
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    if (isAudioCat && !isTouch) stopAudio();
                  }}
                  onClick={() => {
                    if (isAudioCat && isTouch) {
                      isPlaying ? stopAudio() : playAudio(nominee);
                    } else {
                      stopAudio();
                      setSelectedNominee(nominee);
                    }
                  }}>
                  {/* Image */}
                  {nominee.imageUrl
                    ? <Image src={nominee.imageUrl} alt={nominee.name} fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    : <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `#${(nominee as any).color || '111108'}` }}>
                        <Trophy className="w-10 h-10 opacity-20" style={{ color: '#c9a227' }} />
                      </div>}

                  {/* Gradient */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(8,6,0,0.97) 0%, rgba(8,6,0,0.35) 55%, rgba(8,6,0,0.05) 100%)' }} />

                  {/* Audio icon */}
                  {isAudioCat && hasAudio && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: isPlaying ? '#c9a227' : 'rgba(8,6,0,0.7)',
                        border: '1px solid rgba(201,162,39,0.4)',
                        transition: 'background 0.2s',
                      }}>
                      <Volume2 className="w-4 h-4" style={{ color: isPlaying ? '#000' : '#c9a227' }} />
                    </div>
                  )}

                  {/* Vote pill on hover (non-audio) */}
                  {!isAudioCat && (
                    <div className="absolute inset-x-0 bottom-16 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="px-4 py-1.5 rounded-full text-xs font-black"
                        style={{ background: 'rgba(201,162,39,0.92)', color: '#000' }}>
                        VOTER ★
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <p className="text-white font-black leading-tight"
                      style={{ fontSize: isTouch ? '13px' : '15px' }}>
                      {nominee.name}
                    </p>
                    {nominee.anime && (
                      <p className="truncate mt-0.5" style={{ color: '#9a8870', fontSize: '11px' }}>
                        {nominee.anime}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio touch: vote button when a track is playing */}
        {isAudioCat && isTouch && playingId && (
          <div className="mt-5 flex justify-center">
            <button onClick={() => {
              const nom = catNominees.find(n => n.id === playingId);
              if (nom) { stopAudio(); setSelectedNominee(nom); }
            }}
              className="px-8 py-3.5 rounded-xl font-black text-sm text-black"
              style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
              Voter pour ce nominé ★
            </button>
          </div>
        )}

        {/* ── Modal : portrait agrandi ── */}
        {selectedNominee && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(4,3,0,0.92)', backdropFilter: 'blur(16px)' }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedNominee(null); }}>

            <div className="flex flex-col items-center gap-5" style={{ maxWidth: '380px', width: '100%' }}>
              {/* Portrait card — large */}
              <div className="relative w-full rounded-2xl overflow-hidden"
                style={{ aspectRatio: '2/3', maxHeight: '70vh', border: '1px solid rgba(201,162,39,0.25)', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}>
                {/* Close button */}
                <button onClick={() => setSelectedNominee(null)}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:brightness-110"
                  style={{ background: 'rgba(8,6,0,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
                  <X className="w-4 h-4" />
                </button>

                {/* Image */}
                {selectedNominee.imageUrl
                  ? <Image src={selectedNominee.imageUrl} alt={selectedNominee.name} fill className="object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: '#111108' }}>
                      <Trophy className="w-16 h-16 opacity-15" style={{ color: '#c9a227' }} />
                    </div>}

                {/* Bottom gradient + name */}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(8,6,0,0.98) 0%, rgba(8,6,0,0.6) 35%, transparent 65%)' }} />
                <div className="absolute bottom-0 inset-x-0 px-5 pb-5">
                  <div className="w-8 h-0.5 rounded-full mb-3" style={{ background: '#c9a227' }} />
                  {selectedNominee.anime && (
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#c9a227' }}>
                      {selectedNominee.anime}
                    </p>
                  )}
                  <h3 className="text-2xl font-black text-white leading-tight">{selectedNominee.name}</h3>
                </div>
              </div>

              {/* Action buttons — below card */}
              <div className="flex gap-3 w-full">
                <button onClick={() => setSelectedNominee(null)}
                  className="px-5 py-3.5 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#9a8870', border: '1px solid rgba(255,255,255,0.09)' }}>
                  Annuler
                </button>
                <button onClick={() => { setSelectedNominee(null); setConfirmNominee(selectedNominee); }}
                  className="flex-1 py-3.5 rounded-xl font-black text-base text-black transition-all hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
                  VOTER ★
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal : confirmation définitive ── */}
        {confirmNominee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(4,3,0,0.94)', backdropFilter: 'blur(16px)' }}>
            <div className="relative w-full rounded-2xl overflow-hidden"
              style={{ maxWidth: '480px', background: '#111108', border: '2px solid rgba(201,162,39,0.4)', boxShadow: '0 0 60px rgba(201,162,39,0.15)' }}>
              <button onClick={() => setConfirmNominee(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:text-white"
                style={{ color: '#665544', background: 'rgba(8,6,0,0.7)' }}>
                <X className="w-4 h-4" />
              </button>
              <div className="flex">
                {confirmNominee.imageUrl && (
                  <div className="relative flex-shrink-0" style={{ width: '160px', minHeight: '220px' }}>
                    <Image src={confirmNominee.imageUrl} alt={confirmNominee.name} fill className="object-cover" />
                    <div className="absolute inset-0"
                      style={{ background: 'linear-gradient(to right, transparent 70%, rgba(17,17,8,1) 100%)' }} />
                  </div>
                )}
                <div className="flex-1 p-6 flex flex-col justify-between" style={{ minHeight: '220px' }}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#c9a227' }}>
                      {activeCat?.titleFr}
                    </p>
                    <h3 className="text-xl font-black text-white mb-1">{confirmNominee.name}</h3>
                    {confirmNominee.anime && (
                      <p className="text-sm mb-3" style={{ color: '#9a8870' }}>{confirmNominee.anime}</p>
                    )}
                    <p className="text-xs" style={{ color: '#665544' }}>
                      Ce vote est définitif et ne pourra pas être modifié.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setConfirmNominee(null)}
                      className="px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#9a8870', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Changer
                    </button>
                    <button onClick={() => handleVoteConfirmed(confirmNominee)} disabled={submitting}
                      className="flex-1 py-3 rounded-xl font-black text-sm text-black transition-all hover:brightness-110"
                      style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? '...' : 'Confirmer ✓'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── EMAIL SENT ─────────────────────────────────────────────────────────────
  if (step === 'email_sent') {
    return (
      <div className="max-w-md mx-auto text-center">
        {/* Recap card */}
        <div className="rounded-2xl p-5 text-left mb-6"
          style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.12)' }}>
          <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: '#c9a227' }}>
            Récapitulatif de vos votes
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {orderedCats.map(cat => {
              const nomId = votes[cat.id];
              const nom = nomId ? nomineesByCategory[cat.id]?.find(n => n.id === nomId) : null;
              return (
                <div key={cat.id} className="flex justify-between items-center gap-3 text-xs py-1"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: '#665544' }} className="truncate">{cat.titleFr}</span>
                  <span className="text-white font-semibold truncate text-right ml-2">{nom?.name ?? '—'}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
          <Send className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Dernière étape !</h2>
        <p className="mb-2" style={{ color: '#9a8870' }}>
          Cliquez ci-dessous pour recevoir votre email de confirmation à :
        </p>
        <p className="font-bold text-white mb-6 text-lg">{voterEmail}</p>

        {submitError && (
          <div className="rounded-xl px-4 py-3 text-sm mb-5 text-left"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {submitError}
          </div>
        )}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-xl font-black text-base text-black flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
          {submitting
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours…</>
            : <><Mail className="w-5 h-5" /> Envoyer l&apos;email de confirmation</>}
        </button>

        <p className="text-xs mt-4" style={{ color: '#4a3a2a' }}>
          Un lien de confirmation vous sera envoyé. Cliquez dessus pour valider définitivement vos votes.
        </p>
      </div>
    );
  }

  // ── SUCCESS (email sent) ───────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', boxShadow: '0 0 50px rgba(201,162,39,0.25)' }}>
          <Mail className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Email envoyé !</h2>
        <p className="mb-2" style={{ color: '#9a8870' }}>
          Un email de confirmation a été envoyé à <span className="text-white font-bold">{voterEmail}</span>.
        </p>
        <p className="text-sm mb-8" style={{ color: '#665544' }}>
          Consultez votre boîte mail et cliquez sur le lien pour valider vos votes.<br />
          Le lien est valide pendant <strong style={{ color: '#9a8870' }}>24 heures</strong>.
        </p>
        <a href={`/${locale}`}
          className="inline-block px-8 py-3 rounded-xl font-black text-black transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
          Retour à l&apos;accueil
        </a>
      </div>
    );
  }

  return null;
}
