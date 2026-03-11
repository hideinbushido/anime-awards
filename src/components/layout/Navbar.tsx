'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Menu, X, Trophy, Globe, LogIn } from 'lucide-react';
import { clsx } from 'clsx';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const switchLocalePath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/categories`, label: t('categories') },
    { href: `/${locale}/nominees`, label: t('nominees') },
    { href: `/${locale}/vote`, label: t('vote'), highlight: true },
    { href: `/${locale}/faq`, label: t('faq') },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#1e1e2e]">
      <div className="container-mobile">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white hidden sm:block">
              <span className="gradient-text">Anime</span> Awards
            </span>
            <span className="text-xs text-purple-400 hidden sm:block">2026</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  link.highlight
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : isActive(link.href)
                    ? 'text-purple-400 bg-purple-400/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <Link
              href={switchLocalePath}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase font-medium">{otherLocale}</span>
            </Link>

            {/* Admin login */}
            <Link
              href={`/${locale}/admin/login`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:block">Connexion</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-[#1e1e2e]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1',
                  link.highlight
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : isActive(link.href)
                    ? 'text-purple-400 bg-purple-400/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
