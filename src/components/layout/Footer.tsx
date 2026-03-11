'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Trophy } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <footer className="border-t border-[#1e1e2e] mt-20">
      <div className="container-mobile py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">
              <span className="gradient-text">Anime</span> Awards{' '}
              <span className="text-purple-400">2026</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {t('home')}
            </Link>
            <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
              {t('about')}
            </Link>
            <Link href={`/${locale}/categories`} className="hover:text-white transition-colors">
              {t('categories')}
            </Link>
            <Link href={`/${locale}/nominees`} className="hover:text-white transition-colors">
              {t('nominees')}
            </Link>
            <Link href={`/${locale}/vote`} className="hover:text-white transition-colors">
              {t('vote')}
            </Link>
            <Link href={`/${locale}/faq`} className="hover:text-white transition-colors">
              {t('faq')}
            </Link>
          </div>

          {/* Copyright + Admin */}
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-sm text-gray-600">
              © 2026 Anime Awards. All rights reserved.
            </p>
            <Link
              href={`/${locale}/admin/login`}
              className="text-xs text-gray-700 hover:text-gray-500 transition-colors"
            >
              Connexion admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
