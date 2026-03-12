import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getActiveEvent, getCategories } from '@/lib/firestore';

// Mapping image de fond par slug de catégorie
const CATEGORY_IMAGES: Record<string, string> = {
  'meilleur-personnage-feminin':  '/FOND_FEMININ.png',
  'personnage-attachant':         '/FOND_ATTACHANT.png',
  'meilleurs-decors':             '/FOND DECOR.jpg',
  'meilleur-isekai':              '/FOND ISEKAI.jpg',
  'meilleur-protagoniste':        '/FOND PROTA.jpg',
  'meilleur-personnage-masculin': '/FOND MASCULIN.png',
  'meilleur-sensei':              '/FOND SENSEI.jpg',
  'meilleur-developpement':       '/FOND DEVELOPPEMENT.png',
  'meilleur-film':                '/FOND FILM.png',
  'meilleur-antagoniste':         '/FOND COMBAT.jpg',
  'meilleur-action':              '/FOND COMBAT.jpg',
};

// Gradients de fallback pour les catégories sans image
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #1a1200, #0f0d09)',
  'linear-gradient(135deg, #0d0b14, #07060a)',
  'linear-gradient(135deg, #160e02, #07060a)',
  'linear-gradient(135deg, #0a0800, #120d03)',
  'linear-gradient(135deg, #0f0c00, #07060a)',
  'linear-gradient(135deg, #120900, #0f0d09)',
];

const PLACEHOLDERS = [
  { id: 'p1',  slug: 'meilleur-drama',              titleFr: 'Meilleur Drama',                     titleEn: 'Best Drama',                     descriptionFr: 'Le drama le plus marquant',             descriptionEn: 'The most impactful drama',               nomineeCount: 5 },
  { id: 'p2',  slug: 'meilleure-romance',            titleFr: 'Meilleure Romance',                  titleEn: 'Best Romance',                    descriptionFr: 'La plus belle histoire d\'amour',       descriptionEn: 'The most beautiful love story',          nomineeCount: 5 },
  { id: 'p3',  slug: 'meilleurs-decors',             titleFr: 'Meilleurs Décors',                   titleEn: 'Best Settings',                   descriptionFr: 'Les plus beaux univers visuels',        descriptionEn: 'The most stunning visual worlds',        nomineeCount: 5 },
  { id: 'p4',  slug: 'meilleur-seinen',              titleFr: 'Meilleur Seinen',                    titleEn: 'Best Seinen',                     descriptionFr: 'Le meilleur seinen de l\'année',        descriptionEn: 'The best seinen of the year',            nomineeCount: 5 },
  { id: 'p5',  slug: 'meilleur-action',              titleFr: 'Meilleur Animé d\'Action',           titleEn: 'Best Action Anime',               descriptionFr: 'L\'action la plus explosive',           descriptionEn: 'The most explosive action',              nomineeCount: 5 },
  { id: 'p6',  slug: 'meilleure-animation',          titleFr: 'Meilleure Animation',                titleEn: 'Best Animation',                  descriptionFr: 'La qualité visuelle la plus époustouflante', descriptionEn: 'The most breathtaking visual quality', nomineeCount: 5 },
  { id: 'p7',  slug: 'meilleur-personnage-masculin', titleFr: 'Meilleur Personnage Masculin',        titleEn: 'Best Male Character',             descriptionFr: 'Le personnage masculin le plus marquant', descriptionEn: 'The most iconic male character',        nomineeCount: 5 },
  { id: 'p8',  slug: 'meilleur-personnage-feminin',  titleFr: 'Meilleur Personnage Féminin',         titleEn: 'Best Female Character',           descriptionFr: 'Le personnage féminin le plus marquant',  descriptionEn: 'The most iconic female character',      nomineeCount: 5 },
  { id: 'p9',  slug: 'deception-annee',              titleFr: 'Déception de l\'Année',              titleEn: 'Disappointment of the Year',      descriptionFr: 'L\'animé qui a le plus déçu',           descriptionEn: 'The most disappointing anime',           nomineeCount: 5 },
  { id: 'p10', slug: 'meilleur-developpement',       titleFr: 'Meilleur Développement',             titleEn: 'Best Character Development',      descriptionFr: 'La progression de personnage la plus réussie', descriptionEn: 'The best character growth',        nomineeCount: 5 },
  { id: 'p11', slug: 'meilleure-comedie',            titleFr: 'Meilleure Comédie',                  titleEn: 'Best Comedy',                     descriptionFr: 'L\'animé qui a le plus fait rire',      descriptionEn: 'The anime that made us laugh the most',  nomineeCount: 5 },
  { id: 'p12', slug: 'meilleure-nouveaute',          titleFr: 'Meilleure Nouveauté',                titleEn: 'Best New Series',                 descriptionFr: 'La nouvelle série la plus prometteuse',  descriptionEn: 'The most promising new series',          nomineeCount: 5 },
  { id: 'p13', slug: 'meilleur-sensei',              titleFr: 'Meilleur Sensei',                    titleEn: 'Best Sensei',                     descriptionFr: 'Le maître ou professeur le plus inspirant', descriptionEn: 'The most inspiring teacher',          nomineeCount: 5 },
  { id: 'p14', slug: 'meilleur-isekai',              titleFr: 'Meilleur Isekai',                    titleEn: 'Best Isekai',                     descriptionFr: 'Le meilleur voyage vers un autre monde', descriptionEn: 'The best journey to another world',      nomineeCount: 5 },
  { id: 'p15', slug: 'meilleur-chara-design',        titleFr: 'Meilleur Chara-Design',              titleEn: 'Best Character Design',           descriptionFr: 'Le design de personnage le plus réussi', descriptionEn: 'The most successful character design',   nomineeCount: 5 },
  { id: 'p16', slug: 'personnage-attachant',         titleFr: 'Personnage le Plus Attachant',        titleEn: 'Most Lovable Character',          descriptionFr: 'Le personnage qu\'on a le plus adoré',   descriptionEn: 'The character we loved the most',        nomineeCount: 5 },
  { id: 'p17', slug: 'meilleur-film',                titleFr: 'Meilleur Film d\'Animation',          titleEn: 'Best Animated Film',              descriptionFr: 'Le meilleur film anime de l\'année',     descriptionEn: 'The best animated film of the year',     nomineeCount: 5 },
  { id: 'p18', slug: 'meilleur-opening',             titleFr: 'Meilleur Opening',                   titleEn: 'Best Opening',                    descriptionFr: 'L\'opening le plus mémorable',           descriptionEn: 'The most memorable opening',             nomineeCount: 5 },
  { id: 'p19', slug: 'meilleur-ending',              titleFr: 'Meilleur Ending',                    titleEn: 'Best Ending',                     descriptionFr: 'L\'ending le plus marquant',             descriptionEn: 'The most impactful ending',              nomineeCount: 5 },
  { id: 'p20', slug: 'meilleure-bande-originale',    titleFr: 'Meilleure Bande Originale',           titleEn: 'Best Original Soundtrack',        descriptionFr: 'La musique la plus épique',              descriptionEn: 'The most epic music',                    nomineeCount: 5 },
  { id: 'p21', slug: 'meilleure-chanson',            titleFr: 'Meilleure Chanson d\'Animé',          titleEn: 'Best Anime Song',                 descriptionFr: 'La chanson qu\'on a le plus écoutée',    descriptionEn: 'The song we listened to the most',       nomineeCount: 5 },
  { id: 'p22', slug: 'meilleur-protagoniste',        titleFr: 'Meilleur Protagoniste',               titleEn: 'Best Protagonist',                descriptionFr: 'Le héros le plus marquant',              descriptionEn: 'The most memorable hero',                nomineeCount: 5 },
  { id: 'p23', slug: 'meilleur-secondaire',          titleFr: 'Meilleur Personnage Secondaire',      titleEn: 'Best Supporting Character',       descriptionFr: 'Le perso secondaire le plus mémorable',  descriptionEn: 'The most memorable supporting character', nomineeCount: 5 },
  { id: 'p24', slug: 'meilleure-suite',              titleFr: 'Meilleure Suite',                    titleEn: 'Best Sequel',                     descriptionFr: 'La suite qui a le mieux honoré l\'original', descriptionEn: 'The sequel that best honored the original', nomineeCount: 5 },
  { id: 'p25', slug: 'meilleur-slice-of-life',       titleFr: 'Meilleur Slice of Life',             titleEn: 'Best Slice of Life',              descriptionFr: 'Le quotidien le plus touchant',          descriptionEn: 'The most touching everyday life',        nomineeCount: 5 },
  { id: 'p26', slug: 'anime-annee',                  titleFr: 'Animé de l\'Année',                  titleEn: 'Anime of the Year',               descriptionFr: 'Le grand prix — meilleur animé 2025',    descriptionEn: 'The grand prize — best anime 2025',       nomineeCount: 5 },
  { id: 'p27', slug: 'meilleur-antagoniste',         titleFr: 'Meilleur Antagoniste',               titleEn: 'Best Antagonist',                 descriptionFr: 'Le méchant qu\'on a adoré détester',     descriptionEn: 'The villain we loved to hate',            nomineeCount: 5 },
];

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

  // Utilise les vrais slugs Firestore si dispo, sinon placeholders
  const displayCategories = categories.length > 0
    ? categories.map((c: any) => ({ ...c, slug: c.slug ?? c.id }))
    : PLACEHOLDERS;

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
            <div className="gold-divider w-40 mx-auto mb-4" />
            <p className="text-lg" style={{ color: '#9a8870' }}>{t('subtitle')}</p>
          </div>

          {/* Grid catégories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayCategories.map((cat: any, i: number) => {
              const slug = cat.slug ?? '';
              const bgImage = CATEGORY_IMAGES[slug];
              const fallback = FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length];

              return (
                <Link
                  key={cat.id}
                  href={`/${locale}/nominees?category=${cat.id}`}
                  className="category-card group relative rounded-2xl overflow-hidden block"
                  style={{ height: '220px', border: '1px solid rgba(201,162,39,0.18)' }}
                >
                  {/* Fond — image ou gradient */}
                  {bgImage ? (
                    <div
                      className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url("${bgImage}")` }}
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ background: fallback }} />
                  )}

                  {/* Overlay dégradé sombre du bas */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(7,6,10,0.95) 0%, rgba(7,6,10,0.65) 50%, rgba(7,6,10,0.3) 100%)' }}
                  />

                  {/* Badge nominés en haut à droite */}
                  <div className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded"
                    style={{ background: 'rgba(7,6,10,0.8)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', backdropFilter: 'blur(8px)' }}
                  >
                    {cat.nomineeCount ?? '—'} {t('nominees')}
                  </div>

                  {/* Numéro discret en haut à gauche */}
                  <div className="absolute top-3 left-4 text-xs font-bold tracking-wider"
                    style={{ color: 'rgba(201,162,39,0.35)' }}
                  >
                    #{String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Contenu bas */}
                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <div className="flex items-end justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-black text-lg leading-tight mb-1 line-clamp-2"
                          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                        >
                          {locale === 'fr' ? cat.titleFr : cat.titleEn}
                        </h3>
                        <p className="text-xs line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ color: '#9a8870' }}
                        >
                          {locale === 'fr' ? cat.descriptionFr : cat.descriptionEn}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', boxShadow: '0 0 15px rgba(201,162,39,0.35)' }}
                      >
                        <ChevronRight className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
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
