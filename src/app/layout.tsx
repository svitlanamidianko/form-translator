import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export const metadata: Metadata = {
  title: "Form Translator",
  description: "Intelligent form translation service - translate text between different linguistic forms and styles",
  keywords: "translation, forms, language, text processing",
  authors: [{ name: "Form Translator Team" }],
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
        className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
