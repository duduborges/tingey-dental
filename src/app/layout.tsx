import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tingey Dental | Family & Cosmetic Dentistry in Twin Falls, ID",
  description:
    "Dr. Brian J. Tingey, DDS provides general, family, cosmetic, and restorative dentistry in Twin Falls, Idaho. Book your appointment today. Call (208) 734-4111.",
  keywords: [
    "dentist Twin Falls",
    "family dentistry Twin Falls ID",
    "cosmetic dentist Twin Falls",
    "Tingey Dental",
    "Dr. Brian Tingey",
    "dental implants Twin Falls",
    "teeth whitening Twin Falls",
  ],
  authors: [{ name: "Tingey Dental" }],
  openGraph: {
    title: "Tingey Dental | Family & Cosmetic Dentistry in Twin Falls, ID",
    description:
      "Trusted dental care for the whole family. General, cosmetic & restorative dentistry by Dr. Brian J. Tingey, DDS.",
    url: "https://tingey-dental.vercel.app",
    siteName: "Tingey Dental",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/hero.webp",
        width: 1200,
        height: 630,
        alt: "Tingey Dental office in Twin Falls, Idaho",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tingey Dental | Family & Cosmetic Dentistry in Twin Falls, ID",
    description:
      "Trusted dental care for the whole family. Book your appointment today!",
    images: ["/images/hero.webp"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
