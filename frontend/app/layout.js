import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";
import LayoutWrapper from "./components/Layouts/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Infosware | Future Ready Solutions",
  description:
    "Infosware - Future Ready Solutions. Explore products and get in touch with our team.",
  keywords:
    "Infosware, e-commerce, RFID Tags, PVC Cards, RFID Cards, products",
  icons: {
    icon: [
      { url: "/infosware-favicon.jpeg?v=3", type: "image/jpeg" },
    ],
    shortcut: "/infosware-favicon.jpeg?v=3",
    apple: "/infosware-favicon.jpeg?v=3",
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}