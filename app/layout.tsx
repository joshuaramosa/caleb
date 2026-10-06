import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Satisfy } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import { Analytics } from "@vercel/analytics/next";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

const scriptFont = Satisfy({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Pollería Don Caleb — Delivery & Restaurante | Tarma, Perú",
  description: "Pollos y broaster riquísimos. Bueno, bonito, barato y bastante. Pide tu delivery en Tarma.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Don Caleb",
  },
  // El favicon sale de app/icon.png (logo del negocio, convención de Next.js).
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // respeta el notch en iOS (safe-area)
  themeColor: "#F0C000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        sansFont.variable,
        displayFont.variable,
        scriptFont.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        {children}
        <Toaster duration={1500} />
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  );
}
