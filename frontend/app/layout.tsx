import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "SmaStama Feedback Hub",
  description: "Official Feedback Portal for SMA Santa Maria Yogyakarta",
  icons: {
    icon: 'https://stamayk.sch.id/icons/logostamayk.svg',
    shortcut: 'https://stamayk.sch.id/icons/logostamayk.svg',
    apple: 'https://stamayk.sch.id/icons/logostamayk.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
