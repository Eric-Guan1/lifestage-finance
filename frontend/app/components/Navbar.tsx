"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const baseLinkClass = "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100";
  const [user, setUser] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const pathname = usePathname();

  // Update user on route change (so after signin that navigates client-side)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("lifestage_user");
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  }, [pathname]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "lifestage_user" || e.key === "lifestage_token") {
        const raw = localStorage.getItem("lifestage_user");
        setUser(raw ? JSON.parse(raw) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lifestage_token");
      localStorage.removeItem("lifestage_user");
      setUser(null);
      window.location.href = "/";
    }
  };

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              LifeStage
            </Link>
          </div>

          <nav className="flex items-center space-x-2">
            <Link href="/" className={baseLinkClass}>
              Home
            </Link>
            <Link href="/dashboard" className={baseLinkClass}>
              Dashboard
            </Link>
            {user ? (
              <>
                <span className="px-3 py-2 text-sm">Welcome, {user.first_name || 'there'}!</span>
                <button onClick={signOut} className="px-3 py-2 text-sm text-gray-600 hover:underline">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/signin" className={baseLinkClass}>
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
