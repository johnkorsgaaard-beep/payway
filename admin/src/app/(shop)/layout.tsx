"use client";

import { ShopSidebar } from "@/components/shop-sidebar";
import { LocaleProvider } from "@/lib/locale-context";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <ShopSidebar />
      <main className="ml-64 min-h-screen bg-[#fafcfe] p-8">{children}</main>
    </LocaleProvider>
  );
}
