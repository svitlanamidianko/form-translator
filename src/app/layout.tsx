import type { Metadata } from "next";
import { Roboto, Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Link preview text (shown when someone shares the site on social media / messengers)
const SITE_URL = "https://www.formtranslator.com";
const SHARE_TITLE = "Form Translator";
const SHARE_DESCRIPTION = "translate text (and now photos 📷) between ontological forms - eli5, buddhist, gen z, corporate, poetic and many more.";

export const metadata: Metadata = {
  // metadataBase turns relative image paths like "/translate-logo.png" into full urls for link previews
  metadataBase: new URL(SITE_URL),
  title: "Form Translator",
  description: "Intelligent form translation service - translate text between different linguistic forms and styles",
  keywords: "translation, forms, language, text processing",
  authors: [{ name: "Form Translator Team" }],
  // Open Graph = the preview card on Facebook, Telegram, WhatsApp, LinkedIn, iMessage...
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Form Translator",
    type: "website",
    images: [
      {
        url: "/translate-logo.png", // existing logo in public/ (986x440)
        width: 986,
        height: 440,
        alt: "Form Translator logo",
      },
    ],
  },
  // Twitter / X preview card
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: ["/translate-logo.png"],
  },
  icons: {
    icon: [
      { url: "/icon-logo.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/icon-logo.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/icon-logo.png?v=2", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/icon-logo.png?v=2",
    apple: "/icon-logo.png?v=2",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${inter.variable} antialiased`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
