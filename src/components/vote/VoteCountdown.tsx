'use client';

import { useEffect, useState } from 'react';

// April 3 2026 at 18:00 Eastern Time (UTC-4)
const VOTE_OPEN  = new Date('2026-04-03T22:00:00Z');
// April 29 2026 at 23:59 Eastern Time (UTC-4)
const VOTE_CLOSE = new Date('2026-04-30T03:59:00Z');

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function VoteCountdown() {
  const [phase, setPhase] = useState<'opening' | 'closing' | 'done'>('opening');
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(VOTE_OPEN));

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      if (now < VOTE_OPEN.getTime()) {
        setPhase('opening');
        setTimeLeft(getTimeLeft(VOTE_OPEN));
      } else if (now < VOTE_CLOSE.getTime()) {
        setPhase('closing');
        setTimeLeft(getTimeLeft(VOTE_CLOSE));
      } else {
        setPhase('done');
        setTimeLeft(null);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (phase === 'done' || !timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, '0');
  const units = [
    { label: 'Jours',    value: timeLeft.days },
    { label: 'Heures',   value: timeLeft.hours },
    { label: 'Minutes',  value: timeLeft.minutes },
    { label: 'Secondes', value: timeLeft.seconds },
  ];

  return (
    <div className="mt-6">
      <p className="text-xs uppercase tracking-widest mb-4 font-bold" style={{ color: '#c9a227' }}>
        {phase === 'opening' ? 'Ouverture des votes dans' : 'Fermeture des votes dans'}
      </p>
      <div className="flex items-center justify-center gap-3">
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="rounded-xl px-4 py-3 text-center min-w-[60px]"
                style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.25)' }}>
                <span className="text-3xl font-black tabular-nums" style={{ color: '#ffd250' }}>
                  {pad(value)}
                </span>
              </div>
              <span className="text-xs mt-1.5" style={{ color: '#6b5e3a' }}>{label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="text-2xl font-black mb-5" style={{ color: '#c9a227' }}>:</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs mt-4" style={{ color: '#6b5e3a' }}>
        {phase === 'opening'
          ? 'Le 3 avril 2026 à 18h00 (heure du Canada)'
          : 'Le 29 avril 2026 à 23h59 (heure du Canada)'}
      </p>
    </div>
  );
}
