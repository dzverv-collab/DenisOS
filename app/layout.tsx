import "./globals.css";
import type { Metadata } from "next";
import { DealStoreProvider } from "@/components/DealStore";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Denis OS",
  description: "Личная CRM для перепродажи техники"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AuthGate>
          <DealStoreProvider>{children}</DealStoreProvider>
        </AuthGate>
      </body>
    </html>
  );
}
