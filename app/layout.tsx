import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css'
import { ClerkProvider } from "@clerk/nextjs";
import { MapProvider } from "./contexts/MapContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tourism Registry",
  description: "A comprehensive tourism provider registry and verification system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#2563eb", // Blue theme to match your navbar
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <MapProvider>
            {children}
          </MapProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}