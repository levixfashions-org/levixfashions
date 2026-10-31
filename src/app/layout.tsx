import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LEVIX | Oversized Streetwear',
  description: 'Premium heavyweight oversized streetwear t-shirts engineered in India. 240-280 GSM cotton drape.',
  metadataBase: new URL('https://thelevix.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07070B] text-white antialiased selection:bg-[#C8FF3D] selection:text-black font-sans">
        {children}
      </body>
    </html>
  );
}
