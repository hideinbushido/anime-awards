'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import type { Category, Nominee } from '@/lib/types';

interface Props {
  categories: Category[];
  nomineesByCategory: Record<string, Nominee[]>;
  locale: string;
  voteHref: string;
  filterAllLabel: string;
  voteNowLabel: string;
  noNomineesLabel: string;
}

export default function NomineesClient({
  categories,
  nomineesByCategory,
  locale,
  voteHref,
  filterAllLabel,
  voteNowLabel,
  noNomineesLabel,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveCategory(null)}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            !activeCategory
              ? 'bg-purple-600 text-white'
              : 'bg-[#111118] border border-[#1e1e2e] text-gray-400 hover:text-white hover:border-purple-500/50'
          )}
        >
          {filterAllLabel}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              activeCategory === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-[#111118] border border-[#1e1e2e] text-gray-400 hover:text-white hover:border-purple-500/50'
            )}
          >
            {locale === 'fr' ? cat.titleFr : cat.titleEn}
          </button>
        ))}
      </div>

      {/* Categories with nominees */}
      <div className="space-y-12">
        {filteredCategories.map((cat) => {
          const nominees = nomineesByCategory[cat.id] || [];
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {locale === 'fr' ? cat.titleFr : cat.titleEn}
                </h2>
                <div className="flex-1 h-px bg-[#1e1e2e]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {nominees.map((nominee) => (
                  <NomineeCard key={nominee.id} nominee={nominee} locale={locale} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-20 text-gray-500">{noNomineesLabel}</div>
      )}

      {/* Vote CTA */}
      <div className="mt-16 text-center">
        <Link
          href={voteHref}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-bold text-lg transition-all hover:scale-105"
        >
          <Trophy className="w-5 h-5" />
          {voteNowLabel}
        </Link>
      </div>
    </div>
  );
}

function NomineeCard({ nominee, locale }: { nominee: Nominee; locale: string }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow group">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0f]">
        <Image
          src={nominee.imageUrl || `https://placehold.co/300x400/111118/8b5cf6?text=${encodeURIComponent(nominee.name)}`}
          alt={nominee.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent" />
      </div>
      <div className="p-3">
        <h3 className="font-bold text-white text-sm leading-tight">{nominee.name}</h3>
        <p className="text-purple-400 text-xs mt-0.5">{nominee.anime}</p>
        {(locale === 'fr' ? nominee.descriptionFr : nominee.descriptionEn) && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">
            {locale === 'fr' ? nominee.descriptionFr : nominee.descriptionEn}
          </p>
        )}
      </div>
    </div>
  );
}
