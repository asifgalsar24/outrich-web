import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const openSansHebrew = localFont({
  src: [
    { path: "../public/fonts/OpenSansHebrewCondensed-Light.ttf",     weight: "300" },
    { path: "../public/fonts/OpenSansHebrewCondensed-Regular.ttf",   weight: "400" },
    { path: "../public/fonts/OpenSansHebrewCondensed-Bold.ttf",      weight: "700" },
    { path: "../public/fonts/OpenSansHebrewCondensed-ExtraBold.ttf", weight: "800" },
  ],
  variable: "--font-osh",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OutRich — מערכת לידים חכמה | Legacy Media",
  description:
    "אנחנו מוצאים את הלידים החמים ביותר בישראל, מנתחים אותם, וכותבים להם מייל בעברית — הכל אוטומטי.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${openSansHebrew.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
