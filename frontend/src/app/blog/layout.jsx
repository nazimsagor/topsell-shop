export const metadata = {
  title: 'Blog',
  description:
    "Tips, guides and product round-ups from the TopSell team — kitchen gadgets, fitness gear, electronics and more, written for shoppers in Bangladesh.",
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | TopSell',
    description:
      "Tips, guides and product round-ups from the TopSell team — kitchen gadgets, fitness gear, electronics and more.",
    url: '/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | TopSell',
    description: "Tips, guides and product round-ups from the TopSell team.",
  },
};

export default function Layout({ children }) {
  return children;
}
