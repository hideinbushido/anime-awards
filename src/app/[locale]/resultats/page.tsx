import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ResultatsClient from '@/components/resultats/ResultatsClient';
import { PLACEHOLDER_CATEGORIES } from '@/app/[locale]/nominees/page';
import { RESULTS_2026 } from '@/data/results2026';

export default async function ResultatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20" style={{ background: '#080600', minHeight: '100vh' }}>
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.10) 0%, transparent 65%)' }} />

        <div className="container-mobile relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c9a227' }}>
              Zenkai Anime Awards 2026
            </p>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">Résultats</span>
            </h1>
            <p className="text-lg" style={{ color: '#9a8870' }}>
              Découvrez les gagnants choisis par la communauté
            </p>
          </div>

          <ResultatsClient categories={PLACEHOLDER_CATEGORIES} results={RESULTS_2026} />
        </div>
      </main>
      <Footer />
    </>
  );
}
