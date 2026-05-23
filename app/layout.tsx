import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeolym Typing Race",
  description: "A school typing race competition with leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}