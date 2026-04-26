import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RequestAccessForm from '@/components/vote/RequestAccessForm';
import { Trophy } from 'lucide-react';

const VOTE_OPEN = process.env.VOTE_OPEN === 'true';

export default async function VotePage({
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
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.08) 0%, transparent 65%)' }} />

        <div className="container-mobile relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">Phase de Vote</span>
            </h1>
            <p className="text-lg" style={{ color: '#9a8870' }}>
              Votez pour vos animés préférés de l&apos;année
            </p>
          </div>

          {VOTE_OPEN ? (
            <RequestAccessForm />
          ) : (
            <div className="max-w-md mx-auto text-center">
              <div className="rounded-2xl p-10"
                style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.2)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)' }}>
                  <Trophy className="w-8 h-8" style={{ color: '#c9a227' }} />
                </div>
                <h2 className="text-2xl font-black text-white mb-3">Les votes sont terminés !</h2>
                <p className="text-base" style={{ color: '#9a8870' }}>
                  Rendez-vous le <strong style={{ color: '#f0e8d0' }}>2 mai</strong> pour découvrir les résultats en direct. 🏆
                </p>

              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
