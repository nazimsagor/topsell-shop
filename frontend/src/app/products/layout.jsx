export const metadata = {
  title: 'All Products',
  description:
    "Browse all products on TopSell — electronics, fashion, home & lifestyle. Filter by category, price and badge with fast delivery across Bangladesh.",
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'All Products | TopSell',
    description:
      "Browse all products on TopSell Bangladesh — electronics, fashion, home & more, with Cash on Delivery.",
    url: '/products',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Products | TopSell',
    description: 'Shop electronics, fashion, home & more on TopSell Bangladesh.',
  },
};

export default function Layout({ children }) {
  return children;
}
