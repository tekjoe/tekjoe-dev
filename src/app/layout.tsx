import type { Metadata } from "next";
import { Geist, Geist_Mono, Bodoni_Moda } from "next/font/google";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "tekjoe | Web Developer",
  description:
    "Web developer with 8+ years of experience building websites and applications for small businesses, nonprofits, and enterprise clients.",
  metadataBase: new URL("https://tekjoe.dev"),
  openGraph: {
    title: "tekjoe | Web Developer",
    description:
      "Web developer with 8+ years of experience building websites and applications for small businesses, nonprofits, and enterprise clients.",
    url: "https://tekjoe.dev",
    siteName: "tekjoe",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-home.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "tekjoe | Web Developer",
    description:
      "Web developer with 8+ years of experience building websites and applications for small businesses, nonprofits, and enterprise clients.",
    images: ["/og-home.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bodoniModa.variable} antialiased`}
      >
        <Header />
        <main className="overflow-visible">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
