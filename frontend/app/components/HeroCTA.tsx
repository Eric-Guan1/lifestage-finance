"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GetStartedButton from "./GetStartedButton";

export default function HeroCTA() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSignedIn(Boolean(localStorage.getItem("lifestage_token")));
    }
  }, []);

  if (signedIn) {
    return (
      <Link
        href="/dashboard"
        className="inline-block rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors"
      >
        View Dashboard
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <GetStartedButton />
      <Link
        href="/signin"
        aria-label="Sign in"
        className="inline-block rounded-lg border border-blue-600 px-5 py-2 text-blue-600 hover:bg-blue-50 transition-colors"
      >
        Sign in
      </Link>
    </div>
  );
}
