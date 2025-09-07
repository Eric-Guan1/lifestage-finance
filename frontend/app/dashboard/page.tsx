"use client";

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Advice = { title: string; description: string };

export default function DashboardPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Advice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("lifestage_token");
    if (!token) {
      router.push("/signin");
      return;
    }

    const fetchPlan = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/plan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            // token missing/invalid: require signin
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

    fetchPlan();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
        </div>

        <section className="bg-white shadow rounded-md p-6">
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
        </section>
      </div>
    </main>
  );
}
