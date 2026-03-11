import { getTranslations } from 'next-intl/server';
import { Trophy, Users, Star, Tv } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations('about');

  const cards = [
    {
      icon: Star,
      title: t('whyTitle'),
      desc: t('whyDesc'),
      color: 'from-purple-600 to-purple-800',
    },
    {
      icon: Users,
      title: t('whoTitle'),
      desc: t('whoDesc'),
      color: 'from-pink-600 to-pink-800',
    },
    {
      icon: Trophy,
      title: t('howTitle'),
      desc: t('howDesc'),
      color: 'from-amber-600 to-amber-800',
    },
    {
      icon: Tv,
      title: t('ceremonyTitle'),
      desc: t('ceremonyDesc'),
      color: 'from-green-600 to-green-800',
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-mobile">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <p className="text-xl text-gray-400">{t('subtitle')}</p>
          </div>

          {/* Description */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">{t('description')}</p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, i) => (
              <div
                key={i}
                className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 card-glow"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
