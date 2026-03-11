import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getActiveEvent, getCategories } from '@/lib/firestore';

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('categories');

  let categories: any[] = [];
  try {
    const event = await getActiveEvent();
    if (event) {
      categories = await getCategories(event.id);
    }
  } catch {
    // Firebase not configured
  }

  const gradients = [
    'from-purple-600 to-purple-800',
    'from-pink-600 to-pink-800',
    'from-amber-600 to-amber-800',
    'from-blue-600 to-blue-800',
    'from-green-600 to-green-800',
    'from-red-600 to-red-800',
    'from-indigo-600 to-indigo-800',
    'from-orange-600 to-orange-800',
    'from-teal-600 to-teal-800',
  ];

  // Placeholder categories when no Firebase
  const placeholders = [
    { id: '1', titleFr: 'Best Anime', titleEn: 'Best Anime', descriptionFr: 'Le meilleur anime de l\'année', descriptionEn: 'The best anime of the year', nomineeCount: 5 },
    { id: '2', titleFr: 'Best Main Character', titleEn: 'Best Main Character', descriptionFr: 'Le meilleur personnage principal', descriptionEn: 'The best main character', nomineeCount: 5 },
    { id: '3', titleFr: 'Best Female Character', titleEn: 'Best Female Character', descriptionFr: 'La meilleure personnage féminine', descriptionEn: 'The best female character', nomineeCount: 5 },
    { id: '4', titleFr: 'Best Villain', titleEn: 'Best Villain', descriptionFr: 'Le meilleur antagoniste', descriptionEn: 'The best villain', nomineeCount: 5 },
    { id: '5', titleFr: 'Best Opening', titleEn: 'Best Opening', descriptionFr: 'L\'opening le plus mémorable', descriptionEn: 'The most memorable opening', nomineeCount: 5 },
    { id: '6', titleFr: 'Best Ending', titleEn: 'Best Ending', descriptionFr: 'Le meilleur ending', descriptionEn: 'The best ending', nomineeCount: 5 },
    { id: '7', titleFr: 'Best Fight', titleEn: 'Best Fight', descriptionFr: 'Le combat le plus épique', descriptionEn: 'The most epic fight', nomineeCount: 5 },
    { id: '8', titleFr: 'Most Emotional Anime', titleEn: 'Most Emotional Anime', descriptionFr: 'L\'anime le plus émouvant', descriptionEn: 'The most emotional anime', nomineeCount: 5 },
    { id: '9', titleFr: 'Best Animation', titleEn: 'Best Animation', descriptionFr: 'La meilleure animation', descriptionEn: 'The best animation', nomineeCount: 5 },
  ];

  const displayCategories = categories.length > 0 ? categories : placeholders;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-mobile">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <p className="text-gray-400 text-lg">{t('subtitle')}</p>
          </div>

          {/* Categories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCategories.map((cat: any, i: number) => (
              <Link
                key={cat.id}
                href={`/${locale}/nominees?category=${cat.id}`}
                className="group bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 card-glow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 bg-[#0a0a0f] border border-[#1e1e2e] px-2 py-1 rounded-full">
                    {cat.nomineeCount ?? '—'} {t('nominees')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {locale === 'fr' ? cat.titleFr : cat.titleEn}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {locale === 'fr' ? cat.descriptionFr : cat.descriptionEn}
                </p>
                <div className="flex items-center gap-1 text-purple-400 text-sm font-medium">
                  {t('seeNominees')}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {displayCategories.length === 0 && (
            <div className="text-center py-20 text-gray-500">{t('noCategories')}</div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
