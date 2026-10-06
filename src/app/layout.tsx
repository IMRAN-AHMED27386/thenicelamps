import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Effects from "@/components/Effects";
import BottomTabs from "@/components/BottomTabs";

// Runs before paint: tags <html> as an installed PWA so the app-style
// bottom tab bar shows without a flash of the browser layout. Covers both
// the modern display-mode media query and older iOS (navigator.standalone).
const pwaDetect = `(function(){try{if(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true){document.documentElement.classList.add('pwa');}}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://thenicelamps.com"),
  title: "TheNiceLamps – Premium Fancy Lighting",
  description:
    "Elevate your space with premium fancy lighting, chandeliers, and floor lamps at TheNiceLamps.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "TheNiceLamps",
    url: "/",
    title: "TheNiceLamps – Premium Fancy Lighting",
    description:
      "Elevate your space with premium fancy lighting, chandeliers, and floor lamps at TheNiceLamps.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=1200&h=630&q=80&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "TheNiceLamps – Premium Fancy Lighting",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "TheNiceLamps",
  },
  verification: {
    google: "",
  },
};

export const viewport: Viewport = {
  themeColor: "#140c0f",
};

import { WishlistProvider } from "@/lib/wishlist";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: pwaDetect }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WishlistProvider>
          <CartProvider>
            <Nav />
            {children}
            <Footer />
            <Effects />
            <BottomTabs />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
