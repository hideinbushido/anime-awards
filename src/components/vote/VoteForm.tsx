'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { CheckCircle, ChevronDown, ChevronUp, Trophy, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Category, Nominee } from '@/lib/types';

interface Props {
  categories: Category[];
  nomineesByCategory: Record<string, Nominee[]>;
  eventId: string;
}

export default function VoteForm({ categories, nomineesByCategory, eventId }: Props) {
  const t = useTranslations('vote');
  const locale = useLocale();
  const router = useRouter();

  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [voterCountry, setVoterCountry] = useState('');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [acceptRules, setAcceptRules] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );

  const handleSelectNominee = (categoryId: string, nomineeId: string) => {
    setVotes((prev) => ({ ...prev, [categoryId]: nomineeId }));
    // Auto-expand next category
    const idx = categories.findIndex((c) => c.id === categoryId);
    if (idx < categories.length - 1) {
      setExpandedCategory(categories[idx + 1].id);
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!voterName.trim()) newErrors.name = t('errors.nameRequired');
    if (!acceptRules) newErrors.rules = t('errors.acceptRules');
    for (const cat of categories) {
      if (!votes[cat.id]) {
        newErrors[cat.id] = t('errors.allCategoriesRequired');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to first error
      const firstErrorEl = document.querySelector('[data-error]');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          voterName: voterName.trim(),
          voterEmail: voterEmail.trim() || undefined,
          voterCountry: voterCountry.trim() || undefined,
          answers: Object.entries(votes).map(([categoryId, nomineeId]) => ({
            categoryId,
            nomineeId,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }

      router.push(`/${locale}/vote/confirmation`);
    } catch (err: any) {
      toast.error(err.message || t('errors.submitFailed'));
      setSubmitting(false);
    }
  };

  const completedCategories = Object.keys(votes).length;
  const totalCategories = categories.length;
  const progress = totalCategories > 0 ? (completedCategories / totalCategories) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Progress bar */}
      <div className="sticky top-16 z-40 bg-[#080600]/95 backdrop-blur-md border-b border-[#2a1e0a] py-3 mb-8">
        <div className="container-mobile">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#9a8870]">
              {completedCategories}/{totalCategories} catégories
            </span>
            <span className="text-[#c9a227] font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#c9a227] to-[#9e7c1e] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Voter info */}
        <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Vos informations</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#c5baa0] mb-2">
                {t('nameLabel')}{' '}
                <span className="text-[#c9a227] text-xs">({t('required')})</span>
              </label>
              <input
                type="text"
                value={voterName}
                onChange={(e) => {
                  setVoterName(e.target.value);
                  if (errors.name) setErrors((p) => { const n = {...p}; delete n.name; return n; });
                }}
                placeholder={t('namePlaceholder')}
                className={clsx(
                  'w-full bg-[#080600] border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a227] transition-colors',
                  errors.name ? 'border-red-500' : 'border-[#2a1e0a]'
                )}
                data-error={errors.name ? 'name' : undefined}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#c5baa0] mb-2">
                  {t('emailLabel')}
                </label>
                <input
                  type="email"
                  value={voterEmail}
                  onChange={(e) => setVoterEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a227] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#c5baa0] mb-2">
                  {t('countryLabel')}
                </label>
                <input
                  type="text"
                  value={voterCountry}
                  onChange={(e) => setVoterCountry(e.target.value)}
                  placeholder={t('countryPlaceholder')}
                  className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a227] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4 mb-8">
          {categories.map((cat, idx) => {
            const nominees = nomineesByCategory[cat.id] || [];
            const selected = votes[cat.id];
            const isExpanded = expandedCategory === cat.id;
            const hasError = !!errors[cat.id];

            return (
              <div
                key={cat.id}
                className={clsx(
                  'bg-[#0f0d09] border rounded-2xl overflow-hidden transition-all',
                  selected ? 'border-[#c9a227]/50' : hasError ? 'border-red-500/50' : 'border-[#2a1e0a]'
                )}
                data-error={hasError ? cat.id : undefined}
              >
                {/* Category header */}
                <button
                  type="button"
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        selected
                          ? 'bg-green-600'
                          : 'bg-gradient-to-br from-[#c9a227] to-[#9e7c1e]'
                      )}
                    >
                      {selected ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Trophy className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#665544]">#{idx + 1}</span>
                        <h3 className="font-bold text-white">
                          {locale === 'fr' ? cat.titleFr : cat.titleEn}
                        </h3>
                      </div>
                      {selected && (
                        <p className="text-xs text-[#c9a227] mt-0.5">
                          ✓ {nominees.find((n) => n.id === selected)?.name}
                        </p>
                      )}
                      {hasError && !selected && (
                        <p className="text-xs text-red-400 mt-0.5">{errors[cat.id]}</p>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#9a8870] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#9a8870] flex-shrink-0" />
                  )}
                </button>

                {/* Nominees */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#2a1e0a] pt-4">
                    <p className="text-xs text-[#665544] mb-4">
                      {locale === 'fr' ? cat.descriptionFr : cat.descriptionEn}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {nominees.map((nominee) => (
                        <button
                          key={nominee.id}
                          type="button"
                          onClick={() => handleSelectNominee(cat.id, nominee.id)}
                          className={clsx(
                            'relative bg-[#080600] border rounded-xl overflow-hidden text-left transition-all hover:scale-[1.02]',
                            selected === nominee.id
                              ? 'border-[#c9a227] shadow-[0_0_20px_rgba(201,162,39,0.3)]'
                              : 'border-[#2a1e0a] hover:border-[#c9a227]/40'
                          )}
                        >
                          <div className="relative aspect-[3/4]">
                            <Image
                              src={nominee.imageUrl || `https://placehold.co/300x400/111118/8b5cf6?text=${encodeURIComponent(nominee.name)}`}
                              alt={nominee.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                            {selected === nominee.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="font-semibold text-white text-xs leading-tight">{nominee.name}</p>
                            <p className="text-[#c9a227] text-xs">{nominee.anime}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Accept rules */}
        <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-6 mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={acceptRules}
                onChange={(e) => {
                  setAcceptRules(e.target.checked);
                  if (errors.rules) setErrors((p) => { const n = {...p}; delete n.rules; return n; });
                }}
                className="sr-only"
              />
              <div
                className={clsx(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  acceptRules ? 'bg-[#c9a227] border-[#c9a227]' : 'border-[#2a1e0a]'
                )}
              >
                {acceptRules && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
            </div>
            <span className="text-[#c5baa0] text-sm">{t('acceptRules')}</span>
          </label>
          {errors.rules && (
            <p className="text-red-400 text-xs mt-2 flex items-center gap-1 ml-8">
              <AlertCircle className="w-3 h-3" /> {errors.rules}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-5 bg-gradient-to-r from-[#c9a227] to-[#9e7c1e]  disabled:opacity-50 disabled:cursor-not-allowed rounded text-black font-bold text-lg transition-all hover:scale-[1.02]  flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('submitting')}
            </>
          ) : (
            <>
              <Trophy className="w-5 h-5" />
              {t('submit')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
