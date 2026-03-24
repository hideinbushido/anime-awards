'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Trophy, User, Mail, Loader2, Send } from 'lucide-react';

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function RequestAccessForm() {
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const nameOk = name.trim().length >= 2;
  const emailOk = validateEmail(email);
  const canSubmit = nameOk && emailOk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/vote/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterName: name.trim(), voterEmail: email.trim(), locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur. Réessayez.');
        return;
      }
      // Dev mode: direct access URL
      if (data.accessUrl) {
        window.location.href = data.accessUrl;
        return;
      }
      setSent(true);
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // ── Email sent ──────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', boxShadow: '0 0 50px rgba(201,162,39,0.25)' }}>
          <Send className="w-9 h-9 text-black" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Vérifie ta boîte mail !</h2>
        <p className="mb-2" style={{ color: '#9a8870' }}>
          Un lien d'accès a été envoyé à
        </p>
        <p className="text-xl font-black text-white mb-4">{email}</p>
        <p className="text-sm mb-8" style={{ color: '#665544' }}>
          Clique sur le lien dans l'email pour accéder aux votes.<br />
          Le lien est valide pendant <strong style={{ color: '#9a8870' }}>24 heures</strong>.
        </p>
        <p className="text-xs" style={{ color: '#3a2e1e' }}>
          Pas reçu ? Vérifie tes spams ou{' '}
          <button onClick={() => { setSent(false); setError(''); }}
            className="underline transition-colors hover:text-white" style={{ color: '#665544' }}>
            recommence
          </button>.
        </p>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl p-8"
        style={{ background: '#111108', border: '1px solid rgba(201,162,39,0.2)' }}>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)' }}>
          <Trophy className="w-7 h-7 text-black" />
        </div>

        <h2 className="text-2xl font-black text-white mb-2 text-center">Accéder aux votes</h2>
        <p className="text-center text-sm mb-8" style={{ color: '#9a8870' }}>
          Entre ton nom et ton email — tu recevras un lien d'accès immédiatement
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-bold mb-2 block" style={{ color: '#c9a227' }}>
              Prénom ou surnom <span style={{ color: '#ff6644' }}>*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#665544' }} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Votre nom"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-[#4a3a2a] outline-none transition-all"
                style={{
                  background: '#0a0800',
                  border: `1px solid ${nameOk ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.07)'}`,
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-bold mb-2 block" style={{ color: '#c9a227' }}>
              Adresse email <span style={{ color: '#ff6644' }}>*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#665544' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-[#4a3a2a] outline-none transition-all"
                style={{
                  background: '#0a0800',
                  border: `1px solid ${email && emailOk ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.07)'}`,
                }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: '#4a3a2a' }}>
              Un lien d'accès vous sera envoyé à cette adresse
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: canSubmit ? 'linear-gradient(135deg, #c9a227, #9e7c1e)' : 'rgba(201,162,39,0.15)',
              color: canSubmit ? '#000' : '#665544',
            }}>
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours…</>
              : <><Mail className="w-5 h-5" /> Recevoir mon lien d&apos;accès</>}
          </button>
        </form>
      </div>
    </div>
  );
}
