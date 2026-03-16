import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, ExternalLink } from 'lucide-react';

// ─── Données de l'équipe ──────────────────────────────────────────────────────
const CREATOR = {
  nickname: 'Rico',
  fullName: 'Kouamé Corentin Paul',
  role: 'Créateur & Organisateur',
  email: 'ricokouame92@gmail.com',
  tiktok: 'https://www.tiktok.com/@ricokouame92',
  photo: '/image/team/Rico.png',
};

const TEAM: {
  nickname: string;
  fullName?: string;
  role?: string;
  email?: string;
  tiktok?: string;
  photo: string;
}[] = [
  {
    nickname: 'Mlle Lord',
    fullName: '',
    role: '',
    email: '',
    tiktok: 'https://www.tiktok.com/@mllelord',
    photo: '/image/team/MlleLord.png',
  },
  {
    nickname: 'Sylver',
    fullName: '',
    role: '',
    email: '',
    tiktok: 'https://www.tiktok.com/@sylver',
    photo: '/image/team/Sylver.png',
  },
  {
    nickname: 'Glann',
    fullName: '',
    role: '',
    email: '',
    tiktok: 'https://www.tiktok.com/@glann',
    photo: '/image/team/Glann.png',
  },
  {
    nickname: 'Afro_Otaku',
    fullName: '',
    role: '',
    email: '',
    tiktok: 'https://www.tiktok.com/@afro_otaku',
    photo: '/image/team/AfroOtaku.png',
  },
  {
    nickname: 'Braizanime',
    fullName: '',
    role: '',
    email: '',
    tiktok: 'https://www.tiktok.com/@braizanime',
    photo: '/image/team/Braizanime.png',
  },
  {
    nickname: 'Jeremiah',
    fullName: '',
    role: '',
    email: '',
    tiktok: 'https://www.tiktok.com/@jeremiah',
    photo: '/image/team/Jeremiah.png',
  },
  {
    nickname: 'Jordy',
    fullName: '',
    role: '',
    email: '',
    tiktok: 'https://www.tiktok.com/@jordy',
    photo: '/image/team/Jordy.png',
  },
];

// ─── TikTok SVG Icon ─────────────────────────────────────────────────────────
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.29 6.29 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z"/>
    </svg>
  );
}

// ─── Avatar placeholder (si pas de photo) ─────────────────────────────────────
function Avatar({ src, alt, size = 120 }: { src: string; alt: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://placehold.co/${size}x${size}/1a0a14/c9a227?text=${encodeURIComponent(alt[0])}`;
      }}
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%' }}
    />
  );
}

export default async function CreateursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20" style={{ background: '#080600', minHeight: '100vh' }}>
        {/* Projecteur */}
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.1) 0%, transparent 65%)' }}
        />

        <div className="container-mobile relative z-10">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c9a227' }}>
              {locale === 'fr' ? 'Derrière l\'événement' : 'Behind the event'}
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              {locale === 'fr' ? 'L\'Équipe' : 'The Team'}
            </h1>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(200,180,140,0.7)' }}>
              {locale === 'fr'
                ? 'Les personnes qui rendent les Zenkai Awards possibles chaque année.'
                : 'The people who make the Zenkai Awards possible every year.'}
            </p>
          </div>

          {/* ── Créateur ── */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.4))' }} />
              <span className="text-xs font-bold uppercase tracking-widest px-3" style={{ color: '#c9a227' }}>
                {locale === 'fr' ? 'Créateur' : 'Creator'}
              </span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(201,162,39,0.4), transparent)' }} />
            </div>

            <div
              className="mx-auto max-w-sm rounded-3xl p-8 flex flex-col items-center text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(201,162,39,0.08), rgba(158,124,30,0.04))',
                border: '1px solid rgba(201,162,39,0.3)',
                boxShadow: '0 0 60px rgba(201,162,39,0.08)',
              }}
            >
              {/* Crown badge */}
              <div
                className="mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', color: '#080600' }}
              >
                👑 Fondateur
              </div>

              {/* Photo */}
              <div
                className="mb-5"
                style={{
                  padding: 3,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c9a227, #e8c54a, #9e7c1e)',
                }}
              >
                <Avatar src={CREATOR.photo} alt={CREATOR.nickname} size={110} />
              </div>

              <h2 className="text-2xl font-black text-white mb-1">{CREATOR.nickname}</h2>
              {CREATOR.fullName && (
                <p className="text-sm mb-1" style={{ color: 'rgba(200,180,140,0.6)' }}>{CREATOR.fullName}</p>
              )}
              <p className="text-xs font-semibold mb-5" style={{ color: '#c9a227' }}>{CREATOR.role}</p>

              <div className="flex flex-col gap-2 w-full">
                {CREATOR.email && (
                  <a
                    href={`mailto:${CREATOR.email}`}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)', color: '#c9a227' }}
                  >
                    <Mail className="w-4 h-4" />
                    {CREATOR.email}
                  </a>
                )}
                {CREATOR.tiktok && (
                  <a
                    href={CREATOR.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #010101, #1a0a1a)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  >
                    <TikTokIcon className="w-4 h-4" />
                    TikTok
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ── Équipe ── */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.4))' }} />
              <span className="text-xs font-bold uppercase tracking-widest px-3" style={{ color: '#c9a227' }}>
                {locale === 'fr' ? 'L\'Équipe' : 'The Team'}
              </span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(201,162,39,0.4), transparent)' }} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {TEAM.map((member) => (
                <div
                  key={member.nickname}
                  className="rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(201,162,39,0.15)',
                  }}
                >
                  {/* Photo */}
                  <div
                    className="mb-4"
                    style={{
                      padding: 2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(201,162,39,0.6), rgba(158,124,30,0.3))',
                    }}
                  >
                    <Avatar src={member.photo} alt={member.nickname} size={80} />
                  </div>

                  <h3 className="text-base font-black text-white mb-1">{member.nickname}</h3>
                  {member.fullName && (
                    <p className="text-xs mb-1" style={{ color: 'rgba(200,180,140,0.5)' }}>{member.fullName}</p>
                  )}
                  {member.role && (
                    <p className="text-xs font-semibold mb-3" style={{ color: '#c9a227' }}>{member.role}</p>
                  )}

                  <div className="flex flex-col gap-1.5 w-full mt-auto">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                        style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.15)', color: 'rgba(201,162,39,0.8)' }}
                      >
                        <Mail className="w-3 h-3" />
                        Mail
                      </a>
                    )}
                    {member.tiktok && (
                      <a
                        href={member.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                      >
                        <TikTokIcon className="w-3 h-3" />
                        TikTok
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
