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
    if (event) categories = await getCategories(event.id);
  } catch {}

  const goldShades = [
    'from-[#c9a227] to-[#9e7c1e]',
    'from-[#e8c54a] to-[#c9a227]',
    'from-[#f5e090] to-[#c9a227]',
    'from-[#a07c1a] to-[#6b4f10]',
    'from-[#c9a227] to-[#e8c54a]',
    'from-[#d4ac2e] to-[#9e7c1e]',
    'from-[#e8c54a] to-[#a07c1a]',
    'from-[#f5e090] to-[#c9a227]',
    'from-[#c9a227] to-[#d4ac2e]',
  ];

  const placeholders = [
    { id: '1', titleFr: 'Best Anime',           titleEn: 'Best Anime',           descriptionFr: 'Le meilleur anime de l\'année',   descriptionEn: 'The best anime of the year',   nomineeCount: 5 },
    { id: '2', titleFr: 'Best Main Character',   titleEn: 'Best Main Character',   descriptionFr: 'Le meilleur personnage principal',descriptionEn: 'The best main character',      nomineeCount: 5 },
    { id: '3', titleFr: 'Best Female Character', titleEn: 'Best Female Character', descriptionFr: 'La meilleure personnage féminine',descriptionEn: 'The best female character',    nomineeCount: 5 },
    { id: '4', titleFr: 'Best Villain',          titleEn: 'Best Villain',          descriptionFr: 'Le meilleur antagoniste',          descriptionEn: 'The best villain',             nomineeCount: 5 },
    { id: '5', titleFr: 'Best Opening',          titleEn: 'Best Opening',          descriptionFr: 'L\'opening le plus mémorable',    descriptionEn: 'The most memorable opening',   nomineeCount: 5 },
    { id: '6', titleFr: 'Best Ending',           titleEn: 'Best Ending',           descriptionFr: 'Le meilleur ending',              descriptionEn: 'The best ending',              nomineeCount: 5 },
    { id: '7', titleFr: 'Best Fight',            titleEn: 'Best Fight',            descriptionFr: 'Le combat le plus épique',        descriptionEn: 'The most epic fight',          nomineeCount: 5 },
    { id: '8', titleFr: 'Most Emotional',        titleEn: 'Most Emotional',        descriptionFr: 'L\'anime le plus émouvant',      descriptionEn: 'The most emotional anime',     nomineeCount: 5 },
    { id: '9', titleFr: 'Best Animation',        titleEn: 'Best Animation',        descriptionFr: 'La meilleure animation',          descriptionEn: 'The best animation',           nomineeCount: 5 },
  ];

  const displayCategories = categories.length > 0 ? categories : placeholders;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20" style={{ background: '#07060a', minHeight: '100vh' }}>
        {/* Projecteur haut */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.1) 0%, transparent 65%)' }} />

        <div className="container-mobile relative z-10">
          {/* Header */}
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <div className="gold-divider w-32 mx-auto mb-4" />
            <p className="text-lg" style={{ color: '#9a8870' }}>{t('subtitle')}</p>
          </div>

          {/* Grid catégories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCategories.map((cat: any, i: number) => (
              <Link key={cat.id} href={`/${locale}/nominees?category=${cat.id}`}
                className="group rounded-xl p-6 card-glow"
                style={{ background: 'rgba(15,13,9,0.9)', border: '1px solid rgba(201,162,39,0.15)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goldShades[i % goldShades.length]} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    style={{ boxShadow: '0 0 15px rgba(201,162,39,0.2)' }}
                  >
                    <Trophy className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded"
                    style={{ color: '#665544', background: 'rgba(7,6,10,0.9)', border: '1px solid rgba(201,162,39,0.12)' }}
                  >
                    {cat.nomineeCount ?? '—'} {t('nominees')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#c9a227] transition-colors">
                  {locale === 'fr' ? cat.titleFr : cat.titleEn}
                </h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: '#665544' }}>
                  {locale === 'fr' ? cat.descriptionFr : cat.descriptionEn}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#c9a227' }}>
                  {t('seeNominees')}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {displayCategories.length === 0 && (
            <div className="text-center py-20" style={{ color: '#665544' }}>{t('noCategories')}</div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
