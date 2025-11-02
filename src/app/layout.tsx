import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { cn, constructMetadata } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import "react-loading-skeleton/dist/skeleton.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Providers>
          <body
            className={cn(
              "min-h-screen font-sans antialiased grainy",
              `${geistSans.variable} ${geistMono.variable} antialiased`
            )}
          >
            <Providers>
              <Navbar></Navbar>
              <Toaster></Toaster>
              {children}
            </Providers>
          </body>
        </Providers>
      </html>
    </ClerkProvider>
  );
}
