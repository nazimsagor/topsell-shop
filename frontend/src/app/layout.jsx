import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Providers from '../components/Providers';

const SITE_URL = 'https://topsell-shop-227t.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TopSell - Bangladesh's Best Online Shop",
    template: '%s | TopSell',
  },
  description:
    "TopSell is Bangladesh's trusted online shopping destination — electronics, fashion, home & more, with fast delivery and Cash on Delivery across Bangladesh.",
  keywords: [
    'TopSell', 'TopSell Shop', 'Bangladesh online shopping', 'BD ecommerce',
    'online shop Bangladesh', 'electronics Bangladesh', 'fashion BD',
    'cash on delivery Bangladesh', 'Dhaka shopping', 'best online store BD',
  ],
  applicationName: 'TopSell',
  authors: [{ name: 'TopSell' }],
  creator: 'TopSell',
  publisher: 'TopSell',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    url: SITE_URL,
    siteName: 'TopSell',
    title: "TopSell - Bangladesh's Best Online Shop",
    description:
      "Shop electronics, fashion, home & more on TopSell — Bangladesh's trusted online store with fast delivery and Cash on Delivery.",
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'TopSell — Bangladesh Online Shopping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "TopSell - Bangladesh's Best Online Shop",
    description: "Bangladesh's trusted online store — electronics, fashion, home & more.",
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
