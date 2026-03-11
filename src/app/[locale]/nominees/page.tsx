import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NomineesClient from '@/components/nominees/NomineesClient';
import { getActiveEvent, getCategories, getNominees } from '@/lib/firestore';
import type { Category, Nominee } from '@/lib/types';

export default async function NomineesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('nominees');

  let categories: Category[] = [];
  let nomineesByCategory: Record<string, Nominee[]> = {};

  try {
    const event = await getActiveEvent();
    if (event) {
      categories = await getCategories(event.id);
      for (const cat of categories) {
        nomineesByCategory[cat.id] = await getNominees(cat.id);
      }
    }
  } catch {
    // Firebase not configured
  }

  // Placeholder data
  if (categories.length === 0) {
    categories = [
      {
        id: 'cat1',
        eventId: 'evt1',
        titleFr: 'Best Anime',
        titleEn: 'Best Anime',
        title: 'Best Anime',
        description: '',
        descriptionFr: 'Le meilleur anime de l\'année',
        descriptionEn: 'The best anime of the year',
        order: 1,
        active: true,
      },
      {
        id: 'cat2',
        eventId: 'evt1',
        titleFr: 'Best Character',
        titleEn: 'Best Character',
        title: 'Best Character',
        description: '',
        descriptionFr: 'Le meilleur personnage',
        descriptionEn: 'The best character',
        order: 2,
        active: true,
      },
    ];
    nomineesByCategory = {
      cat1: [
        { id: 'n1', categoryId: 'cat1', name: 'Frieren', anime: 'Sousou no Frieren', imageUrl: 'https://placehold.co/300x400/111118/8b5cf6?text=Frieren', description: '', descriptionFr: '', descriptionEn: '', active: true },
        { id: 'n2', categoryId: 'cat1', name: 'Jujutsu Kaisen S2', anime: 'Jujutsu Kaisen', imageUrl: 'https://placehold.co/300x400/111118/ec4899?text=JJK', description: '', descriptionFr: '', descriptionEn: '', active: true },
        { id: 'n3', categoryId: 'cat1', name: 'Oshi no Ko', anime: 'Oshi no Ko', imageUrl: 'https://placehold.co/300x400/111118/f59e0b?text=ONK', description: '', descriptionFr: '', descriptionEn: '', active: true },
      ],
      cat2: [
        { id: 'n4', categoryId: 'cat2', name: 'Frieren', anime: 'Sousou no Frieren', imageUrl: 'https://placehold.co/300x400/111118/8b5cf6?text=Frieren', description: '', descriptionFr: '', descriptionEn: '', active: true },
        { id: 'n5', categoryId: 'cat2', name: 'Sukuna', anime: 'Jujutsu Kaisen', imageUrl: 'https://placehold.co/300x400/111118/dc2626?text=Sukuna', description: '', descriptionFr: '', descriptionEn: '', active: true },
      ],
    };
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-mobile">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <p className="text-gray-400 text-lg">{t('subtitle')}</p>
          </div>

          <NomineesClient
            categories={categories}
            nomineesByCategory={nomineesByCategory}
            locale={locale}
            voteHref={`/${locale}/vote`}
            filterAllLabel={t('filterAll')}
            voteNowLabel={t('voteNow')}
            noNomineesLabel={t('noNominees')}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
