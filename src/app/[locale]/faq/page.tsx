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
      <main className="pt-24 pb-20">
        <div className="container-mobile">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <p className="text-gray-400 text-lg">{t('subtitle')}</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {questions.map((item, i) => (
              <div
                key={i}
                className="bg-[#111118] border border-[#1e1e2e] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-white">{item.q}</span>
                  </div>
                  {openIdx === i ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  )}
                </button>
                {openIdx === i && (
                  <div className="px-6 pb-6 border-t border-[#1e1e2e] pt-4">
                    <p className="text-gray-400 leading-relaxed">{item.a}</p>
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
