import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'NEXUS // OS v1.0',
  description: 'Portfolio cinématique immersif NEXUS',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-black text-white antialiased selection:bg-[#00d1ff] selection:text-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
