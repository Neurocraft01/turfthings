import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Turf Things | Book Premium Sports Turf in Karvenagar, Pune",
  description:
    "Book premium FIFA-standard sports turf in Karvenagar, Pune at Turf Things. Football & Cricket grounds available for booking near Dudhane Lawns, Sun Empire Road. Real-time slot availability, instant confirmation.",
  keywords: [
    "turf booking Pune",
    "turf booking Karvenagar",
    "sports turf Pune",
    "football turf Karvenagar",
    "cricket turf Karvenagar",
    "book sports grounds Pune",
    "Turf Things Pune",
    "Dudhane lawns turf",
    "Sun Empire Road turf"
  ],
  icons: {
    icon: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${bebasNeue.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground selection:bg-brand selection:text-white dark:bg-[#0a1a0c] dark:text-white transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
