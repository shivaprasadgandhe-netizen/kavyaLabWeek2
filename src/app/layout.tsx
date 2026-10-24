import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kavya Labs | Build smarter with AI, built in Bengaluru",
  description:
    "Kavya Labs helps engineering and product teams ship AI-powered products faster with enterprise-ready infrastructure, rapid model integration, and scalable deployment.",
  keywords: ["Kavya Labs", "AI startup", "Bengaluru", "AI infrastructure", "enterprise AI"],
  authors: [{ name: "Kavya Labs" }],
  openGraph: {
    title: "Kavya Labs | Build smarter with AI, built in Bengaluru",
    description:
      "Kavya Labs helps engineering and product teams ship AI-powered products faster.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
