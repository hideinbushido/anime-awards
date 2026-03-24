'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, ChevronLeft, Trophy, User, AtSign, Star, X } from 'lucide-react';
import type { Category, Nominee } from '@/lib/types';

type Step = 'confirm' | 'identity' | 'categories' | 'nominees' | 'success';

interface Props {
  categories: Category[];
  nomineesByCategory: Record<string, Nominee[]>;
  eventId: string;
  locale: string;
}

export default function VoteFlow({ categories, nomineesByCategory, eventId, locale }: Props) {
  const [step, setStep] = useState<Step>('confirm');
  const [voterName, setVoterName] = useState('');
  const [voterTiktok, setVoterTiktok] = useState('');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmNominee, setConfirmNominee] = useState<Nominee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // p-annee toujours en dernier
  const orderedCats = [...categories].sort((a, b) => {
    if (a.id === 'p-annee') return 1;
    if (b.id === 'p-annee') return -1;
    return 0;
  });

  const total = orderedCats.length;
  const votedCount = Object.keys(votes).length;

  const handleVoteConfirmed = async (nominee: Nominee) => {
    const newVotes = { ...votes, [nominee.categoryId]: nominee.id };
    setVotes(newVotes);
    setConfirmNominee(null);
    setExpandedId(null);

    if (Object.keys(newVotes).length === total) {
      setSubmitting(true);
      try {
        const res = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            voterName: voterName.trim(),
            voterTiktok: voterTiktok.trim() || undefined,
            answers: Object.entries(newVotes).map(([categoryId, nomineeId]) => ({ categoryId, nomineeId })),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSubmitError(res.status === 429
            ? 'Vous avez déjà voté depuis cette adresse.'
            : data.error || 'Erreur lors de la soumission.');
        }
      } catch {
        setSubmitError('Erreur réseau.');
      } finally {
        setSubmitting(false);
        setStep('success');
      }
    } else {
      setStep('categories');
      setActiveCat(null);
    }
  };

  // ── CONFIRM ──────────────────────────────────────────────────────────────────
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
            Votre choix sera définitif par catégorie.
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

  // ── IDENTITY ─────────────────────────────────────────────────────────────────
  if (step === 'identity') {
    const valid = voterName.trim().length >= 2;
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl p-8"
          style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.2)' }}>
          <h2 className="text-2xl font-black text-white mb-1 text-center">Qui êtes-vous ?</h2>
          <p className="text-center text-sm mb-8" style={{ color: '#9a8870' }}>
            Ces informations nous permettent de valider votre vote
          </p>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold mb-2 block" style={{ color: '#c9a227' }}>
                Prénom ou surnom <span style={{ color: '#ff6644' }}>*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#665544' }} />
                <input type="text" value={voterName} onChange={e => setVoterName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-[#4a3a2a] outline-none"
                  style={{ background: '#0a0800', border: `1px solid ${valid ? 'rgba(201,162,39,0.35)' : 'rgba(255,255,255,0.07)'}`, transition: 'border-color 0.2s' }} />
              </div>
            </div>
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
          <button onClick={() => valid && setStep('categories')} disabled={!valid}
            className="w-full mt-7 py-4 rounded-xl font-black text-base transition-all"
            style={{
              background: valid ? 'linear-gradient(135deg, #c9a227, #9e7c1e)' : 'rgba(201,162,39,0.15)',
              color: valid ? '#000' : '#665544',
              cursor: valid ? 'pointer' : 'not-allowed',
            }}>
            Commencer à voter →
          </button>
        </div>
      </div>
    );
  }

  // ── CATEGORIES ───────────────────────────────────────────────────────────────
  if (step === 'categories') {
    return (
      <div>
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold" style={{ color: '#9a8870' }}>Progression</span>
            <span className="text-sm font-black" style={{ color: '#c9a227' }}>
              {votedCount} / {total} catégories
            </span>
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
            ? 'Continuez — choisissez la prochaine catégorie'
            : 'Finalisation en cours...'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedCats.map((cat) => {
            const nomineeId = votes[cat.id];
            const nominee = nomineeId ? nomineesByCategory[cat.id]?.find(n => n.id === nomineeId) : null;
            const voted = !!nomineeId;
            return (
              <button key={cat.id}
                onClick={() => { if (!voted) { setActiveCat(cat); setExpandedId(null); setStep('nominees'); } }}
                disabled={voted}
                className="relative rounded-2xl overflow-hidden text-left group transition-all duration-200"
                style={{
                  height: '100px',
                  border: voted ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  background: voted ? 'rgba(201,162,39,0.04)' : '#111108',
                  cursor: voted ? 'default' : 'pointer',
                }}>
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
                      </div>
                  }
                  <div className="min-w-0">
                    <p className="font-black truncate text-sm" style={{ color: voted ? '#c9a227' : 'white' }}>
                      {cat.titleFr}
                    </p>
                    {voted && nominee
                      ? <p className="text-white text-xs truncate mt-0.5 font-semibold">{nominee.name}</p>
                      : <p className="text-xs mt-0.5 group-hover:text-[#c9a227] transition-colors" style={{ color: '#4a3a2a' }}>
                          Voter →
                        </p>
                    }
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── NOMINEES ─────────────────────────────────────────────────────────────────
  if (step === 'nominees' && activeCat) {
    const catNominees = (nomineesByCategory[activeCat.id] ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

    return (
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => { setStep('categories'); setExpandedId(null); setConfirmNominee(null); }}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all hover:text-white"
            style={{ color: '#9a8870', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <ChevronLeft className="w-4 h-4" /> Retour
          </button>
          <div>
            <h2 className="text-xl font-black text-white leading-tight">{activeCat.titleFr}</h2>
            <p className="text-xs" style={{ color: '#665544' }}>Cliquez sur un nominé pour l&apos;agrandir, puis votez</p>
          </div>
        </div>

        {/* Grid nominés */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {catNominees.map((nominee) => {
            const isExpanded = expandedId === nominee.id;
            return (
              <div key={nominee.id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'col-span-2 sm:col-span-3 lg:col-span-4' : 'cursor-pointer'}`}
                style={{
                  border: isExpanded ? '2px solid rgba(201,162,39,0.5)' : '1px solid rgba(255,255,255,0.07)',
                  background: '#111108',
                }}
                onClick={() => { if (!isExpanded) setExpandedId(nominee.id); }}>

                {isExpanded ? (
                  // Carte agrandie
                  <div className="flex flex-col sm:flex-row">
                    {nominee.imageUrl && (
                      <div className="relative w-full sm:w-56 flex-shrink-0" style={{ minHeight: '220px' }}>
                        <Image src={nominee.imageUrl} alt={nominee.name} fill className="object-cover" />
                        <div className="absolute inset-0 sm:hidden"
                          style={{ background: 'linear-gradient(to top, rgba(8,6,0,1) 0%, transparent 60%)' }} />
                      </div>
                    )}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        {nominee.anime && (
                          <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: '#c9a227' }}>
                            {nominee.anime}
                          </p>
                        )}
                        <h3 className="text-2xl font-black text-white mb-2">{nominee.name}</h3>
                        {nominee.descriptionFr && (
                          <p className="text-sm" style={{ color: '#9a8870' }}>{nominee.descriptionFr}</p>
                        )}
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                          className="px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', color: '#9a8870', border: '1px solid rgba(255,255,255,0.08)' }}>
                          Annuler
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmNominee(nominee); }}
                          className="flex-1 py-3 rounded-xl font-black text-base text-black transition-all hover:brightness-110"
                          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
                          VOTER ★
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Carte normale
                  <div className="group">
                    <div className="relative w-full overflow-hidden" style={{ height: '150px' }}>
                      {nominee.imageUrl ? (
                        <>
                          <Image src={nominee.imageUrl} alt={nominee.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0"
                            style={{ background: 'linear-gradient(to top, rgba(8,6,0,0.9) 0%, rgba(8,6,0,0.2) 60%, transparent 100%)' }} />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background: `#${ (nominee as any).color || '111108'}` }}>
                          <Trophy className="w-10 h-10 opacity-20" style={{ color: `#${ (nominee as any).textColor || 'c9a227'}` }} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-white font-black text-sm truncate">{nominee.name}</p>
                      {nominee.anime && <p className="text-xs truncate mt-0.5" style={{ color: '#665544' }}>{nominee.anime}</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal confirmation vote */}
        {confirmNominee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(8,6,0,0.92)', backdropFilter: 'blur(10px)' }}>
            <div className="relative max-w-sm w-full rounded-2xl p-7 text-center"
              style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.3)' }}>
              <button onClick={() => setConfirmNominee(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg transition-all hover:text-white"
                style={{ color: '#665544', background: 'rgba(255,255,255,0.04)' }}>
                <X className="w-4 h-4" />
              </button>
              {confirmNominee.imageUrl && (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4">
                  <Image src={confirmNominee.imageUrl} alt={confirmNominee.name} fill className="object-cover" />
                </div>
              )}
              <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: '#c9a227' }}>
                {activeCat?.titleFr}
              </p>
              <h3 className="text-xl font-black text-white mb-1">{confirmNominee.name}</h3>
              {confirmNominee.anime && (
                <p className="text-sm mb-4" style={{ color: '#9a8870' }}>{confirmNominee.anime}</p>
              )}
              <p className="text-sm mb-6" style={{ color: '#665544' }}>
                Êtes-vous sûr de votre choix ?<br />Ce vote sera définitif.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmNominee(null)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
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
        )}
      </div>
    );
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', boxShadow: '0 0 50px rgba(201,162,39,0.25)' }}>
          <CheckCircle className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">
          {submitError ? 'Attention' : 'Vote enregistré !'}
        </h2>
        {submitError ? (
          <p className="mb-6 text-sm" style={{ color: '#ff8866' }}>{submitError}</p>
        ) : (
          <>
            <p className="mb-2" style={{ color: '#9a8870' }}>
              Merci <span className="text-white font-bold">{voterName}</span>, vos votes ont bien été pris en compte.
            </p>
            <p className="text-sm mb-8" style={{ color: '#665544' }}>
              Les résultats seront annoncés en direct sur TikTok.
            </p>
          </>
        )}

        {/* Récapitulatif */}
        <div className="mb-8 text-left rounded-2xl p-5" style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.15)' }}>
          <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: '#c9a227' }}>
            Récapitulatif de vos votes
          </p>
          <div className="space-y-2">
            {orderedCats.map(cat => {
              const nomId = votes[cat.id];
              const nom = nomId ? nomineesByCategory[cat.id]?.find(n => n.id === nomId) : null;
              return (
                <div key={cat.id} className="flex justify-between items-center gap-3 text-sm">
                  <span className="truncate" style={{ color: '#665544' }}>{cat.titleFr}</span>
                  <span className="text-white font-semibold truncate text-right">{nom?.name ?? '—'}</span>
                </div>
              );
            })}
          </div>
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
