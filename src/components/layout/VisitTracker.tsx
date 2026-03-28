'use client';
import { useEffect } from 'react';

export default function VisitTracker() {
  useEffect(() => {
    if (sessionStorage.getItem('zk_visited')) return;
    sessionStorage.setItem('zk_visited', '1');
    fetch('/api/track-visit', { method: 'POST' }).catch(() => {});
  }, []);
  return null;
}
