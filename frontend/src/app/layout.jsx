import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Providers from '../components/Providers';

export const metadata = {
  title: { default: 'TopSell Shop', template: '%s | TopSell Shop' },
  description: 'Your one-stop shop for the best deals online',
  keywords: ['ecommerce', 'shopping', 'deals', 'products'],
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
