import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Press Parlor · The Counter",
  description:
    "Student ambassadors assemble photos and video for school and district socials. The scoop waits in the freezer until an administrator approves it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-cream font-sans text-chocolate antialiased">
        {children}
      </body>
    </html>
  );
}
