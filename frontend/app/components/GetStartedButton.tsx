"use client";

import { useRouter } from "next/navigation";

export default function GetStartedButton() {
  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && localStorage.getItem("lifestage_token")) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <button
      onClick={onClick}
      className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
    >
      Get Started
    </button>
  );
}
