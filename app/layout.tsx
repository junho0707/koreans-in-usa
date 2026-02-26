import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupabaseProvider } from "@/src/components/providers/supabase-provider";
import { I18nProvider } from "@/src/lib/i18n/context";
import { Navbar } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";
import { ScrollToTop } from "@/src/components/ui/scroll-to-top";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koreans in USA",
  description: "Community for Koreans living in the United States",
  openGraph: {
    title: "Koreans in USA",
    description: "Community for Koreans living in the United States",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <SupabaseProvider>
          <I18nProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
            <ScrollToTop />
          </I18nProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
