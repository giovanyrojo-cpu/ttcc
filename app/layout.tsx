import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Top Ten Command Center",
  description: "CRM y dashboard de Top Ten Property",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
        <NavBar />
      </body>
    </html>
  );
}
