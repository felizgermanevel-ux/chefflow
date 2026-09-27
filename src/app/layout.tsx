import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChefFlow | Inventario de cocina",
  description: "Una base simple para el inventario de restaurantes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
