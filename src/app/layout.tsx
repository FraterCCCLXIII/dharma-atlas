import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { DM_Sans } from "next/font/google";
import { BetaWelcomeModal } from "@/components/layout/BetaWelcomeModal";
import { PublicSiteShell } from "@/components/layout/PublicSiteShell";
import "./globals.css";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "https://dharmaatlas.com"),
  title: "Dharma Atlas | Temples, Monasteries & Ashrams",
  description:
    "Explore Buddhist temples, monasteries, meditation centers, and ashrams worldwide on an interactive map.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <PublicSiteShell>{children}</PublicSiteShell>
        <BetaWelcomeModal />
        {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
      </body>
    </html>
  );
}
