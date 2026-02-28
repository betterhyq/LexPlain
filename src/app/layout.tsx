import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "LexPlain — Legal Documents in Plain English",
  description:
    "Upload any contract, NDA, lease, or legal document. Get an instant plain-language summary, clause breakdown, and risk alerts — no law degree needed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
