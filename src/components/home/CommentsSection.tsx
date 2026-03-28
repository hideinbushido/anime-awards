'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Send, ChevronDown } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

function fmtDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const COLORS = ['#c9a227', '#a78bfa', '#4ade80', '#f472b6', '#60a5fa', '#fb923c'];
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

const PAGE_SIZE = 5;

export default function CommentsSection({ locale }: { locale: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    fetch('/api/comments')
      .then(r => r.json())
      .then(d => setComments(d.comments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !text.trim()) { setError(locale === 'fr' ? 'Remplis tous les champs.' : 'Fill all fields.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erreur.'); return; }
      setSuccess(true);
      setName('');
      setText('');
      // Optimistically add the comment to the list
      setComments(prev => [{
        id: data.id ?? String(Date.now()),
        name: name.trim(),
        text: text.trim(),
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError(locale === 'fr' ? 'Erreur réseau.' : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  const fr = locale === 'fr';

  return (
    <section className="relative py-20 overflow-hidden" style={{
      borderTop: '1px solid rgba(201,162,39,0.12)',
      background: 'linear-gradient(160deg, #0e0b05 0%, #080600 40%, #120e04 70%, #080600 100%)',
    }}>
      {/* Projecteur haut */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.1) 0%, transparent 65%)' }} />

      <div className="container-mobile relative z-10">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.25)', color: '#c9a227' }}>
            <MessageSquare className="w-3.5 h-3.5" />
            {fr ? 'Vos avis' : 'Your feedback'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            {fr ? 'Donnez votre avis' : 'Share your thoughts'}
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#9a8870' }}>
            {fr
              ? 'Une suggestion, une idée pour améliorer l\'événement ? Écrivez-la ici.'
              : 'A suggestion or idea to improve the event? Write it here.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">

          {/* Formulaire */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(15,13,9,0.85)', border: '1px solid rgba(201,162,39,0.2)', backdropFilter: 'blur(12px)' }}>
            <h3 className="text-base font-bold text-white mb-5">
              {fr ? '✍️ Laisser un commentaire' : '✍️ Leave a comment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#c9a227' }}>
                  {fr ? 'Pseudo / Nom' : 'Nickname / Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={50}
                  placeholder={fr ? 'Ex: SakuraChan99' : 'Ex: SakuraChan99'}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-1"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,162,39,0.2)', color: 'white' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(201,162,39,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(201,162,39,0.2)')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#c9a227' }}>
                  {fr ? 'Message' : 'Message'}
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder={fr ? 'Votre avis, suggestion ou idée...' : 'Your feedback, suggestion or idea...'}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,162,39,0.2)', color: 'white' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(201,162,39,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(201,162,39,0.2)')}
                />
                <p className="text-right text-xs mt-1" style={{ color: '#4a3a2a' }}>{text.length}/500</p>
              </div>

              {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>}
              {success && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                {fr ? '✓ Commentaire publié !' : '✓ Comment published!'}
              </p>}

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', color: '#080600' }}>
                <Send className="w-4 h-4" />
                {submitting ? (fr ? 'Envoi...' : 'Sending...') : (fr ? 'Publier' : 'Publish')}
              </button>
            </form>
          </div>

          {/* Liste des commentaires */}
          <div className="space-y-3">
            {loading && (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                ))}
              </div>
            )}

            {!loading && comments.length === 0 && (
              <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(15,13,9,0.5)', border: '1px solid rgba(201,162,39,0.1)' }}>
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#c9a227' }} />
                <p className="text-sm" style={{ color: '#4a3a2a' }}>
                  {fr ? 'Aucun commentaire pour l\'instant. Soyez le premier !' : 'No comments yet. Be the first!'}
                </p>
              </div>
            )}

            {!loading && comments.slice(0, shown).map(c => {
              const color = colorFor(c.name);
              return (
                <div key={c.id} className="rounded-2xl p-4" style={{ background: 'rgba(15,13,9,0.7)', border: '1px solid rgba(201,162,39,0.1)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                      {getInitials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{c.name}</p>
                      {c.createdAt && <p className="text-xs" style={{ color: '#4a3a2a' }}>{fmtDate(c.createdAt)}</p>}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#9a8870' }}>{c.text}</p>
                </div>
              );
            })}

            {!loading && comments.length > shown && (
              <button onClick={() => setShown(s => s + PAGE_SIZE)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
                style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)', color: '#c9a227' }}>
                <ChevronDown className="w-4 h-4" />
                {fr ? `Voir plus (${comments.length - shown})` : `Show more (${comments.length - shown})`}
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
