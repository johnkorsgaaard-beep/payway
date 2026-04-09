"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShopSidebar } from "@/components/shop-sidebar";
import { LocaleProvider } from "@/lib/locale-context";
import { useAuth } from "@/lib/auth-context";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { state, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state === "unauthenticated") {
      router.replace("/portal");
    } else if (state === "authenticated" && role !== "merchant" && role !== "admin") {
      router.replace("/portal");
    }
  }, [state, role, router]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafcfe]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2ec964] border-t-transparent" />
      </div>
    );
  }

  if (state !== "authenticated" || (role !== "merchant" && role !== "admin")) {
    return null;
  }

  return (
    <LocaleProvider>
      <ShopSidebar />
      <main className="ml-64 min-h-screen bg-[#fafcfe] p-8">{children}</main>
    </LocaleProvider>
  );
}
