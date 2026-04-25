import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Providers from '../components/Providers';

export const metadata = {
  title: {
    default: "TopSell - Bangladesh's Best Online Shop",
    template: '%s | TopSell',
  },
  description:
    "TopSell is Bangladesh's trusted online shopping destination — electronics, fashion, home & more, with fast delivery and Cash on Delivery.",
  keywords: ['TopSell', 'Bangladesh', 'online shopping', 'ecommerce', 'BD', 'electronics', 'fashion'],
  applicationName: 'TopSell',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
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
