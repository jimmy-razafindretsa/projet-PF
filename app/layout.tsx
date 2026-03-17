import type { Metadata } from "next";
import { Inter, Roboto_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { NavigationProgressBar } from "./components/progress_bar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "François Bertho Production",
  description: "Order management platform for François Bertho",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} ${playfair.variable} antialiased`}
      >
        <NavigationProgressBar />
        {children}
      </body>
    </html>
  );
}
