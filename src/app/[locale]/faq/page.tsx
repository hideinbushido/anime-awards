'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function FAQPage() {
  const t = useTranslations('faq');
  const questions = t.raw('questions') as Array<{ q: string; a: string }>;
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20" style={{ background: '#080600', minHeight: '100vh' }}>
        {/* Projecteur */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.1) 0%, transparent 65%)' }} />

        <div className="container-mobile relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <div className="gold-divider w-32 mx-auto mb-4" />
            <p className="text-lg" style={{ color: '#9a8870' }}>{t('subtitle')}</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {questions.map((item, i) => (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(15,13,9,0.9)',
                  border: `1px solid ${openIdx === i ? 'rgba(201,162,39,0.35)' : 'rgba(201,162,39,0.12)'}`,
                  boxShadow: openIdx === i ? '0 0 20px rgba(201,162,39,0.08)' : 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
              >
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}
                    >
                      <HelpCircle className="w-4 h-4 text-black" />
                    </div>
                    <span className={clsx('font-semibold', openIdx === i ? 'text-[#e8c54a]' : 'text-white')}>
                      {item.q}
                    </span>
                  </div>
                  {openIdx === i
                    ? <ChevronUp className="w-5 h-5 flex-shrink-0 ml-4" style={{ color: '#c9a227' }} />
                    : <ChevronDown className="w-5 h-5 flex-shrink-0 ml-4" style={{ color: '#665544' }} />
                  }
                </button>
                {openIdx === i && (
                  <div className="px-6 pb-6 pt-4" style={{ borderTop: '1px solid rgba(201,162,39,0.1)' }}>
                    <p className="leading-relaxed" style={{ color: '#9a8870' }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
