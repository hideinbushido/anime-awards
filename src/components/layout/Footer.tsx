'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Trophy } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <footer className="mt-20 border-t" style={{ borderColor: 'rgba(201,162,39,0.12)' }}>
      <div className="container-mobile py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c9a227, #e8c54a)' }}
            >
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white">
              <span className="gradient-text">Anime</span> Awards{' '}
              <span style={{ color: '#c9a227' }}>2026</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: '#665544' }}>
            {[t('home'), t('about'), t('categories'), t('nominees'), t('vote'), t('faq')].map((label, i) => {
              const paths = ['', '/about', '/categories', '/nominees', '/vote', '/faq'];
              return (
                <Link key={i} href={`/${locale}${paths[i]}`}
                  className="transition-colors hover:text-[#c9a227]"
                  style={{ color: '#665544' }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Copyright */}
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-sm" style={{ color: '#3a2e1e' }}>
              © 2026 Anime Awards. All rights reserved.
            </p>
            <Link href={`/${locale}/admin/login`}
              className="text-xs transition-colors hover:text-[#c9a227]"
              style={{ color: '#3a2e1e' }}
            >
              Connexion admin
            </Link>
          </div>
        </div>

        {/* Ligne décorative */}
        <div className="mt-8 gold-divider" />
      </div>
    </footer>
  );
}
