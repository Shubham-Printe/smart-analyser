import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import ThemeProvider from '@/theme/themeProvider';
import { Container } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import { UploadProvider } from '@/app/context/UploadContext';
import { BrandingProvider } from '@/app/context/BrandingContext';
import GlobalLoader from '@/components/GlobalLoader';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Smart PDF Analyzer',
  description: 'Intelligent document processing and analysis platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
        <body className={inter.className}>
          <ThemeProvider>
            <BrandingProvider>
              <UploadProvider>
                <Header />
                <GlobalLoader />
                <KeyboardShortcuts />
                <Toaster position="top-center" />
                <Container maxWidth="md" sx={{ py: 6 }}>
                  {children}
                </Container>
              </UploadProvider>
            </BrandingProvider>
          </ThemeProvider>
        </body>
    </html>
  );
}
