'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Trophy,
  LayoutDashboard,
  Tag,
  Users,
  Vote,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: 'categories', label: 'Catégories', icon: Tag },
  { href: 'nominees', label: 'Nominés', icon: Users },
  { href: 'votes', label: 'Votes', icon: Vote },
  { href: 'settings', label: 'Paramètres', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!auth) {
      router.push(`/${locale}/admin/login`);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push(`/${locale}/admin/login`);
      } else {
        setLoading(false);
      }
    });
    return unsub;
  }, [locale, router]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push(`/${locale}/admin/login`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-[#2a1e0a]">
        <Link href={`/${locale}/admin/dashboard`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a227] to-[#9e7c1e] flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm gradient-text">Anime Awards</span>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const href = `/${locale}/admin/${item.href}`;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={item.href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#c9a227] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2a1e0a]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0f0d09] border-r border-[#2a1e0a] fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-[#0f0d09] border-r border-[#2a1e0a] flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-[#0f0d09] border-b border-[#2a1e0a] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-white gradient-text">Anime Awards Admin</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
