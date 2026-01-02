import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { BenefitProvider } from '@/context/BenefitContext';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Credit Card Benefit Organizer",
  description: "Organize and compare your credit card benefits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <BenefitProvider>
          {children}
        </BenefitProvider>
      </body>
    </html>
  );
}

