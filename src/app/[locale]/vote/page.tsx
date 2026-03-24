import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RequestAccessForm from '@/components/vote/RequestAccessForm';

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

          <RequestAccessForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
