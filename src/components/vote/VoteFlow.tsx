'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  CheckCircle, ChevronLeft, ChevronRight, Trophy,
  Star, X, Volume2, Loader2, Mail,
} from 'lucide-react';
import type { Category, Nominee } from '@/lib/types';

type Step = 'categories' | 'nominees' | 'success';

interface Props {
  categories: Category[];
  nomineesByCategory: Record<string, Nominee[]>;
  eventId: string;
  locale: string;
  voterName: string;
  voterEmail: string;
  accessToken?: string;
}

export default function VoteFlow({
  categories, nomineesByCategory, eventId, locale,
  voterName, voterEmail, accessToken,
}: Props) {
  const storageKey = accessToken ? `voteProgress_${accessToken}` : null;

  const [step, setStep] = useState<Step>('categories');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
  const [confirmNominee, setConfirmNominee] = useState<Nominee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showFinConfirm, setShowFinConfirm] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsTouch(window.matchMedia('(hover: none)').matches); }, []);

  // Restore vote progress from localStorage on mount
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setVotes(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setPlayingId(null);
    window.dispatchEvent(new Event('card-audio-stop'));
  }, []);

  const playAudio = useCallback((nominee: Nominee) => {
    if (!(nominee as any).audioUrl) return;
    stopAudio();
    window.dispatchEvent(new Event('card-audio-start'));
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
  const cardW = isTouch ? 160 : 320;
  const cardH = isTouch ? 240 : 480;

  const submitVotes = async (currentVotes: Record<string, string>) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const answers = Object.entries(currentVotes).map(([categoryId, nomineeId]) => ({ categoryId, nomineeId }));
      const res = await fetch('/api/vote/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, voterName, voterEmail, answers, token: accessToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Erreur lors de la soumission.');
      } else {
        if (storageKey) { try { localStorage.removeItem(storageKey); } catch {} }
      }
    } catch {
      setSubmitError('Erreur réseau.');
    } finally {
      setSubmitting(false);
      setStep('success');
    }
  };

  const handleVoteConfirmed = async (nominee: Nominee) => {
    stopAudio();
    const newVotes = { ...votes, [nominee.categoryId]: nominee.id };
    setVotes(newVotes);
    setConfirmNominee(null);
    setSelectedNominee(null);

    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(newVotes)); } catch {}
    }

    if (Object.keys(newVotes).length === total) {
      await submitVotes(newVotes);
    } else {
      setStep('categories');
      setActiveCat(null);
    }
  };

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
          {votedCount === 0
            ? 'Choisissez une catégorie pour commencer'
            : votedCount < total
              ? `Reprise — ${votedCount} catégorie${votedCount > 1 ? 's' : ''} déjà votée${votedCount > 1 ? 's' : ''}`
              : 'Finalisation…'}
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
                style={{
                  height: '100px',
                  border: voted ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  background: voted ? 'rgba(201,162,39,0.04)' : '#111108',
                  cursor: voted ? 'default' : 'pointer',
                }}>
                {!voted && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
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

        {/* FIN DE VOTE — visible dès qu'au moins 1 catégorie votée et pas toutes */}
        {votedCount > 0 && votedCount < total && (
          <div className="mt-8 text-center">
            <button onClick={() => setShowFinConfirm(true)}
              className="px-8 py-3.5 rounded-xl font-black text-sm transition-all hover:brightness-110"
              style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227' }}>
              Terminer et envoyer mon récap ({votedCount}/{total}) →
            </button>
            <p className="text-xs mt-2" style={{ color: '#4a3a2a' }}>
              Les catégories non votées ne seront pas comptées.
            </p>
          </div>
        )}

        {/* Confirmation FIN DE VOTE */}
        {showFinConfirm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(4,3,0,0.94)', backdropFilter: 'blur(16px)' }}>
            <div className="w-full rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 text-center"
              style={{ maxWidth: '420px', background: '#111108', border: '2px solid rgba(201,162,39,0.4)' }}>
              <p className="text-lg font-black text-white mb-2">Terminer le vote ?</p>
              <p className="text-sm mb-1" style={{ color: '#9a8870' }}>
                Tu as voté dans <span style={{ color: '#c9a227' }}>{votedCount} catégorie{votedCount > 1 ? 's' : ''}</span> sur {total}.
              </p>
              <p className="text-sm mb-6" style={{ color: '#9a8870' }}>
                Ton récap sera envoyé par mail. Ce choix est définitif.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowFinConfirm(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#9a8870', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Continuer à voter
                </button>
                <button onClick={async () => { setShowFinConfirm(false); await submitVotes(votes); }}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-black text-sm text-black"
                  style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmer ✓'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── NOMINEES ───────────────────────────────────────────────────────────────
  if (step === 'nominees' && activeCat) {
    const catNominees = (nomineesByCategory[activeCat.id] ?? [])
      .slice().sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

    const catTitle = (activeCat.titleFr + ' ' + (activeCat.titleEn ?? '')).toLowerCase();
    const isAudioCat = catTitle.includes('opening') || catTitle.includes('ending') || catTitle.includes('chanson');

    return (
      <div>
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

        {/* Scroll vitrine */}
        <div className="relative">
          {!isTouch && (
            <button onClick={() => scrollRef.current?.scrollBy({ left: -(cardW + 16), behavior: 'smooth' })}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:brightness-125"
              style={{ background: 'rgba(8,6,0,0.85)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', backdropFilter: 'blur(4px)' }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {!isTouch && (
            <button onClick={() => scrollRef.current?.scrollBy({ left: cardW + 16, behavior: 'smooth' })}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:brightness-125"
              style={{ background: 'rgba(8,6,0,0.85)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', backdropFilter: 'blur(4px)' }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Mobile: grille 2 colonnes scroll vertical / Desktop: scroll horizontal */}
          <div ref={scrollRef}
            className={isTouch ? 'grid grid-cols-2 gap-3 pb-3' : 'flex gap-4 pb-3'}
            style={isTouch ? {} : {
              overflowX: 'auto', scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
              paddingLeft: '44px', paddingRight: '44px',
            }}>
            {catNominees.map((nominee) => {
              const isPlaying = playingId === nominee.id;
              const hasAudio = !!(nominee as any).audioUrl;

              return (
                <div key={nominee.id}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  style={{
                    width: isTouch ? '100%' : `${cardW}px`,
                    height: isTouch ? '200px' : `${cardH}px`,
                    flexShrink: isTouch ? undefined : 0,
                    scrollSnapAlign: isTouch ? undefined : 'start',
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
                    if (isAudioCat && isTouch) { playAudio(nominee); }
                    else { stopAudio(); setSelectedNominee(nominee); }
                  }}>
                  {nominee.imageUrl
                    ? <Image src={nominee.imageUrl} alt={nominee.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    : <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#111108' }}>
                        <Trophy className="w-10 h-10 opacity-20" style={{ color: '#c9a227' }} />
                      </div>}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(8,6,0,0.97) 0%, rgba(8,6,0,0.35) 55%, rgba(8,6,0,0.05) 100%)' }} />
                  {isAudioCat && hasAudio && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: isPlaying ? '#c9a227' : 'rgba(8,6,0,0.7)', border: '1px solid rgba(201,162,39,0.4)', transition: 'background 0.2s' }}>
                      <Volume2 className="w-4 h-4" style={{ color: isPlaying ? '#000' : '#c9a227' }} />
                    </div>
                  )}
                  {isAudioCat && isTouch && isPlaying && (
                    <button
                      onClick={e => { e.stopPropagation(); stopAudio(); setSelectedNominee(nominee); }}
                      className="absolute bottom-10 inset-x-2 py-2 rounded-xl font-black text-xs text-black text-center z-10"
                      style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
                      VOTER ★
                    </button>
                  )}
                  {!isAudioCat && (
                    <div className="absolute inset-x-0 bottom-16 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="px-4 py-1.5 rounded-full text-xs font-black" style={{ background: 'rgba(201,162,39,0.92)', color: '#000' }}>
                        VOTER ★
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <p className="text-white font-black leading-tight" style={{ fontSize: isTouch ? '13px' : '15px' }}>{nominee.name}</p>
                    {nominee.anime && <p className="truncate mt-0.5" style={{ color: '#9a8870', fontSize: '11px' }}>{nominee.anime}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Portrait modal */}
        {selectedNominee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(4,3,0,0.92)', backdropFilter: 'blur(16px)' }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedNominee(null); }}>
            <div className="flex flex-col items-center gap-5" style={{ maxWidth: '380px', width: '100%' }}>
              <div className="relative w-full rounded-2xl overflow-hidden"
                style={{ aspectRatio: '2/3', maxHeight: '70vh', border: '1px solid rgba(201,162,39,0.25)', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}>
                <button onClick={() => setSelectedNominee(null)}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:brightness-110"
                  style={{ background: 'rgba(8,6,0,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
                  <X className="w-4 h-4" />
                </button>
                {selectedNominee.imageUrl
                  ? <Image src={selectedNominee.imageUrl} alt={selectedNominee.name} fill className="object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#111108' }}>
                      <Trophy className="w-16 h-16 opacity-15" style={{ color: '#c9a227' }} />
                    </div>}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(8,6,0,0.98) 0%, rgba(8,6,0,0.6) 35%, transparent 65%)' }} />
                <div className="absolute bottom-0 inset-x-0 px-5 pb-5">
                  <div className="w-8 h-0.5 rounded-full mb-3" style={{ background: '#c9a227' }} />
                  {selectedNominee.anime && (
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#c9a227' }}>{selectedNominee.anime}</p>
                  )}
                  <h3 className="text-2xl font-black text-white leading-tight">{selectedNominee.name}</h3>
                </div>
              </div>
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

        {/* Confirm modal */}
        {confirmNominee && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(4,3,0,0.94)', backdropFilter: 'blur(16px)' }}>
            <div className="relative w-full rounded-t-2xl sm:rounded-2xl overflow-hidden"
              style={{ maxWidth: '500px', background: '#111108', border: '2px solid rgba(201,162,39,0.4)', boxShadow: '0 0 80px rgba(201,162,39,0.2)' }}>
              <button onClick={() => setConfirmNominee(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-xl flex items-center justify-center hover:text-white transition-all"
                style={{ color: '#665544', background: 'rgba(8,6,0,0.7)' }}>
                <X className="w-5 h-5" />
              </button>
              {/* Mobile: vertical layout / Desktop: horizontal */}
              <div className="flex flex-col sm:flex-row">
                {confirmNominee.imageUrl && (
                  <div className="relative w-full sm:w-48 flex-shrink-0" style={{ height: '180px', minHeight: 'unset' }}>
                    <Image src={confirmNominee.imageUrl} alt={confirmNominee.name} fill className="object-cover object-top" />
                    <div className="absolute inset-0 sm:hidden" style={{ background: 'linear-gradient(to bottom, transparent 50%, #111108 100%)' }} />
                    <div className="absolute inset-0 hidden sm:block" style={{ background: 'linear-gradient(to right, transparent 65%, #111108 100%)' }} />
                  </div>
                )}
                <div className="flex-1 px-5 pb-5 pt-3 sm:p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#c9a227' }}>{activeCat?.titleFr}</p>
                    <h3 className="text-xl font-black text-white mb-1 leading-tight">{confirmNominee.name}</h3>
                    {confirmNominee.anime && <p className="text-sm mb-2" style={{ color: '#9a8870' }}>{confirmNominee.anime}</p>}
                    <p className="text-xs" style={{ color: '#665544' }}>Ce vote est définitif.</p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setConfirmNominee(null)}
                      className="px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#9a8870', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Changer
                    </button>
                    <button onClick={() => handleVoteConfirmed(confirmNominee)} disabled={submitting}
                      className="flex-1 py-3 rounded-xl font-black text-sm text-black transition-all hover:brightness-110"
                      style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmer ✓'}
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

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', boxShadow: '0 0 50px rgba(201,162,39,0.25)' }}>
          {submitError ? <X className="w-10 h-10 text-black" /> : <CheckCircle className="w-10 h-10 text-black" />}
        </div>

        <h2 className="text-3xl font-black text-white mb-3">
          {submitError ? 'Attention' : 'Votes enregistrés !'}
        </h2>

        {submitError
          ? <p className="mb-6 text-sm" style={{ color: '#ff8866' }}>{submitError}</p>
          : <>
              <p className="mb-2" style={{ color: '#9a8870' }}>
                Merci <span className="text-white font-bold">{voterName}</span> — tes votes ont bien été pris en compte.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm mb-8" style={{ color: '#665544' }}>
                <Mail className="w-4 h-4" />
                Un récapitulatif a été envoyé à <span className="font-semibold" style={{ color: '#9a8870' }}>{voterEmail}</span>
              </div>
            </>}

        {/* Recap */}
        <div className="text-left rounded-2xl p-5 mb-8"
          style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.15)' }}>
          <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: '#c9a227' }}>
            Récapitulatif
          </p>
          <div className="space-y-1.5">
            {orderedCats.map(cat => {
              const nomId = votes[cat.id];
              const nom = nomId ? nomineesByCategory[cat.id]?.find(n => n.id === nomId) : null;
              return (
                <div key={cat.id} className="flex justify-between items-center gap-3 text-sm py-1"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: '#665544' }} className="truncate">{cat.titleFr}</span>
                  <span className="text-white font-semibold truncate text-right ml-2">{nom?.name ?? '—'}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl p-4 mb-8 flex items-center justify-center gap-2"
          style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)' }}>
          <span className="text-sm font-bold" style={{ color: '#c9a227' }}>📅 Résultats le 2 mai en direct sur TikTok</span>
        </div>

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
