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
    { icon: Star,   title: t('whyTitle'),      desc: t('whyDesc'),      shade: 'from-[#c9a227] to-[#9e7c1e]' },
    { icon: Users,  title: t('whoTitle'),      desc: t('whoDesc'),      shade: 'from-[#e8c54a] to-[#c9a227]' },
    { icon: Trophy, title: t('howTitle'),      desc: t('howDesc'),      shade: 'from-[#f5e090] to-[#c9a227]' },
    { icon: Tv,     title: t('ceremonyTitle'), desc: t('ceremonyDesc'), shade: 'from-[#d4ac2e] to-[#9e7c1e]' },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20" style={{ background: '#07060a', minHeight: '100vh' }}>
        {/* Projecteur */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.1) 0%, transparent 65%)' }} />

        <div className="container-mobile relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <div className="gold-divider w-32 mx-auto mb-4" />
            <p className="text-xl" style={{ color: '#9a8870' }}>{t('subtitle')}</p>
          </div>

          {/* Description principale */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(15,13,9,0.9)', border: '1px solid rgba(201,162,39,0.2)', boxShadow: '0 0 40px rgba(201,162,39,0.08)' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #c9a227, #e8c54a)', boxShadow: '0 0 25px rgba(201,162,39,0.3)' }}
              >
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <p className="text-lg leading-relaxed" style={{ color: '#c5baa0' }}>{t('description')}</p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, i) => (
              <div key={i} className="rounded-2xl p-8 card-glow"
                style={{ background: 'rgba(15,13,9,0.9)', border: '1px solid rgba(201,162,39,0.15)' }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.shade} flex items-center justify-center mb-4`}
                  style={{ boxShadow: '0 0 15px rgba(201,162,39,0.2)' }}
                >
                  <card.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="leading-relaxed" style={{ color: '#9a8870' }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
