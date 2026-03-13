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
    { href: `/${locale}/vote`, label: t('vote'), highlight: true },
    { href: `/${locale}/faq`, label: t('faq') },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'rgba(7,6,10,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(201,162,39,0.15)' }}
    >
      <div className="container-mobile">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ background: 'linear-gradient(135deg, #c9a227, #e8c54a)' }}
            >
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white hidden sm:block">
              <span className="gradient-text">Anime</span> Awards
            </span>
            <span className="text-xs hidden sm:block" style={{ color: '#c9a227' }}>2026</span>
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
                    ? 'text-black font-bold'
                    : isActive(link.href)
                    ? 'text-[#e8c54a]'
                    : 'text-[#9a8870] hover:text-white hover:bg-white/5'
                )}
                style={link.highlight ? { background: 'linear-gradient(135deg, #c9a227, #e8c54a)', color: '#07060a' } : {}}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href={switchLocalePath}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{ color: '#9a8870' }}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase font-medium">{otherLocale}</span>
            </Link>

            <Link
              href={`/${locale}/admin/login`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{ color: '#9a8870' }}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:block">Connexion</span>
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg transition-all"
              style={{ color: '#9a8870' }}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t" style={{ borderColor: 'rgba(201,162,39,0.12)' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1',
                  link.highlight ? 'text-black font-bold' : ''
                )}
                style={
                  link.highlight
                    ? { background: 'linear-gradient(135deg, #c9a227, #e8c54a)', color: '#07060a' }
                    : isActive(link.href)
                    ? { color: '#e8c54a', background: 'rgba(201,162,39,0.08)' }
                    : { color: '#9a8870' }
                }
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
