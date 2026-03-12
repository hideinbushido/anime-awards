'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Trophy, Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!auth) throw new Error('Firebase not configured');
      await signInWithEmailAndPassword(auth, email, password);
      router.push(`/${locale}/admin/dashboard`);
    } catch {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#07060a' }}>
      {/* Projecteur */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.12) 0%, transparent 65%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #c9a227, #e8c54a)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
          >
            <Trophy className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white">
            <span className="gradient-text">Anime Awards</span> 2026
          </h1>
          <p className="text-sm mt-1" style={{ color: '#665544' }}>Espace administrateur</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(15,13,9,0.95)', border: '1px solid rgba(201,162,39,0.2)', boxShadow: '0 0 40px rgba(201,162,39,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5" style={{ color: '#c9a227' }} />
            <h2 className="text-lg font-bold text-white">Connexion Admin</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#c5baa0' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full rounded-xl px-4 py-3 text-white placeholder-[#3a2e1e] focus:outline-none transition-colors"
                style={{ background: '#07060a', border: '1px solid rgba(201,162,39,0.2)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(201,162,39,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201,162,39,0.2)'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#c5baa0' }}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-white placeholder-[#3a2e1e] focus:outline-none transition-colors"
                style={{ background: '#07060a', border: '1px solid rgba(201,162,39,0.2)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(201,162,39,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201,162,39,0.2)'}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3"
                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center justify-center gap-2 btn-gold"
              style={{ boxShadow: '0 0 20px rgba(201,162,39,0.3)' }}
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : 'Se connecter'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
