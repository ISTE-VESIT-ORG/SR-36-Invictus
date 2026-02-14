import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
    title: 'AstroView - Explore the Universe',
    description: 'Real-time space data, simplified for everyone. Track celestial events, missions, and see how satellites impact Earth.',
    keywords: ['space', 'astronomy', 'satellites', 'NASA', 'celestial events', 'education'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
                <Navbar />
                {children}
                <Footer />
            </body>
        </html>
    );
}
