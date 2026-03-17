'use client';

export function TeamAvatar({ src, alt, size = 80 }: { src: string; alt: string; size?: number }) {
  const initials = alt.slice(0, 2).toUpperCase();
  const fallback = `https://placehold.co/${size}x${size}/1a0a14/c9a227?text=${encodeURIComponent(initials)}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || fallback}
      alt={alt}
      width={size}
      height={size}
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallback;
      }}
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%' }}
    />
  );
}
