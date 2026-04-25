export const metadata = {
  title: 'Contact Us',
  description:
    "Get in touch with TopSell — call, email or WhatsApp our team for help with orders, products, shipping or anything else. We reply within 24 hours.",
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us | TopSell',
    description:
      "Reach the TopSell support team by phone, email or WhatsApp — we’re here to help with orders, products and shipping.",
    url: '/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | TopSell',
    description: "Reach TopSell by phone, email or WhatsApp — we reply within 24 hours.",
  },
};

export default function Layout({ children }) {
  return children;
}
