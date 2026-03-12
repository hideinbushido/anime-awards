'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;
    audio.loop = true;

    // Tente l'autoplay avec son
    audio.muted = false;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay réussi avec son
          setMuted(false);
        })
        .catch(() => {
          // Navigateur a bloqué — affiche la bannière après 1s
          audio.muted = true;
          audio.play().catch(() => {});
          setMuted(true);
          setTimeout(() => setShowBanner(true), 1000);
        });
    }
  }, []);

  const enableSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.play().catch(() => {});
    setMuted(false);
    setShowBanner(false);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.muted = false;
      audio.play().catch(() => {});
      setMuted(false);
    } else {
      audio.muted = true;
      setMuted(true);
    }
    setShowBanner(false);
  };

  return (
    <>
      {/* ── MUSIQUE — change le nom du fichier ici ── */}
      <audio ref={audioRef} src="/music.mp3" loop preload="auto" />
      {/* ─────────────────────────────────────────── */}

      {/* Bannière popup — s'affiche si le navigateur a bloqué l'autoplay */}
      {showBanner && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="mx-4 rounded-3xl p-8 sm:p-12 text-center max-w-sm w-full"
            style={{
              background: 'linear-gradient(135deg, #0a0a1a, #12051a)',
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: '0 0 60px rgba(124,58,237,0.3), 0 0 120px rgba(236,72,153,0.1)',
            }}
          >
            <div className="text-5xl mb-4">🎵</div>
            <h2 className="text-2xl font-black text-white mb-2">Anime Awards 2026</h2>
            <p className="text-gray-400 text-sm mb-8">Active le son pour une expérience complète !</p>
            <button
              onClick={enableSound}
              className="w-full py-4 rounded-2xl font-black text-white text-lg mb-3 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
                boxShadow: '0 0 30px rgba(124,58,237,0.5)',
              }}
            >
              <Volume2 className="w-5 h-5 inline mr-2" />
              Activer la musique 🎶
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="w-full py-3 rounded-2xl text-gray-500 text-sm hover:text-gray-300 transition-colors"
            >
              Continuer sans son
            </button>
          </div>
        </div>
      )}

      {/* Bouton flottant — coin bas gauche */}
      <button
        onClick={toggle}
        aria-label={muted ? 'Activer la musique' : 'Couper la musique'}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm transition-all duration-300"
        style={{
          background: muted
            ? 'rgba(10,10,26,0.9)'
            : 'linear-gradient(135deg, #7c3aed, #ec4899)',
          border: muted ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
          boxShadow: muted
            ? '0 0 20px rgba(124,58,237,0.15)'
            : '0 0 25px rgba(124,58,237,0.5)',
          color: 'white',
          backdropFilter: 'blur(10px)',
        }}
      >
        {muted ? (
          <><VolumeX className="w-4 h-4" /><span className="hidden sm:inline">Son off</span></>
        ) : (
          <><Volume2 className="w-4 h-4" /><span className="hidden sm:inline">Son on</span></>
        )}
      </button>
    </>
  );
}
