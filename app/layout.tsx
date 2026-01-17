import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", // Allows use as a CSS variable
});

export const metadata: Metadata = {
  title: "Apex Academy | Excellence in Education",
  description: "Shaping future leaders through innovative education and character development",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body>
        {children}
      </body>
    </html>
  );
}