import { Inter } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://next-page-mvp.vercel.app'),
  title: 'NextPage',
  description:
    'NextPage é a sua plataforma online de desenvolvimento pessoal. Baixe ebooks de diversos assuntos e comece a se desenvolver agora.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={'min-h-full'}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var pathname = window.location.pathname;
                  var isAdminRoute = pathname && pathname.startsWith('/admin');
                  if (isAdminRoute) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Adicionar classe para habilitar transições após o carregamento inicial
                  setTimeout(function() {
                    document.documentElement.classList.add('theme-loaded');
                  }, 100);
                } catch (e) {
                  console.error('Error setting theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthSessionProvider>
            {children}
            <Toaster />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
