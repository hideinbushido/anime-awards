import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';

const locales = ['fr', 'en'];

export const metadata: Metadata = {
  title: {
    default: 'Anime Awards 2026',
    template: '%s | Anime Awards 2026',
  },
  description: 'Les récompenses anime de la communauté — The community anime awards',
  openGraph: {
    title: 'Anime Awards 2026',
    description: 'Votez pour vos animés préférés !',
    type: 'website',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="anime-bg min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#111118',
                color: '#f0f0f5',
                border: '1px solid #1e1e2e',
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
