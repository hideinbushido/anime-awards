'use client';
import { useEffect } from 'react';

export default function VisitTracker() {
  useEffect(() => {
    if (sessionStorage.getItem('zk_visited')) return;
    sessionStorage.setItem('zk_visited', '1');
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer: document.referrer }),
    }).catch(() => {});
  }, []);
  return null;
}
