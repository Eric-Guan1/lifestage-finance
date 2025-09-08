"use client";

"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
const StudentLoanTracker = dynamic(() => import("./StudentLoanTracker"), { ssr: false });
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Advice = { title: string; description: string };

export default function DashboardPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Advice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    // Only check auth here; fetching the plan is done on-demand when the user
    // clicks "Show Plan" so the dashboard doesn't display the plan by default.
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("lifestage_token");
    if (!token) {
      router.push("/signin");
      return;
    }
    // initial state: not loading until user requests the plan
    setLoading(false);
  }, [router]);

  const loadPlan = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("lifestage_token");
    if (!token) {
      router.push("/signin");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/plan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/signin`);
          return;
        }
        if (res.status === 404) {
          setPlan([]);
          return;
        }
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      setPlan(data.steps || []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
        </div>

        <section className="bg-white shadow rounded-md p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Personalized Plan</h2>
            <div>
              {!showPlan ? (
                <button
                  onClick={async () => {
                    setShowPlan(true);
                    await loadPlan();
                  }}
                  className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                >
                  Show Plan
                </button>
              ) : (
                <button
                  onClick={() => setShowPlan(false)}
                  className="inline-block rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hide Plan
                </button>
              )}
            </div>
          </div>

          {!showPlan && <p className="text-gray-600">Your plan is hidden. Click "Show Plan" to view it.</p>}

          {showPlan && (
            <>
              {loading && <p className="text-gray-600">Loading your plan…</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && plan && plan.length === 0 && (
                <p className="text-gray-700">No saved plan found for your account.</p>
              )}

              {!loading && plan && plan.length > 0 && (
                <ol className="space-y-4 list-decimal list-inside">
                  {plan.map((s, i) => (
                    <li key={i} className="bg-white rounded-md p-4 border">
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-gray-700">{s.description}</p>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </section>

        {/* Student Loan Tracker component */}
        <div className="mt-6">
          {/* @ts-ignore */}
          <StudentLoanTracker />
        </div>
      </div>
    </main>
  );
}
