import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LexAI — Legal Document Risk Analysis",
  description:
    "Upload legal documents and let AI identify risky clauses with visual annotations. Powered by fine-tuned legal language models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-[#fbf9f6] text-[#1c1917] tracking-tight`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
