import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Palmares from '@/components/resultats/Palmares';

export default async function ResultatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: '#080600', minHeight: '100vh' }}>
        <Palmares locale={locale} />
      </main>
      <Footer />
    </>
  );
}
