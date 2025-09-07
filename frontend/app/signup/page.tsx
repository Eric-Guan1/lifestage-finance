"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [onboarding, setOnboarding] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lifestage_onboarding");
      if (stored) setOnboarding(JSON.parse(stored));
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      // Attempt to create user
      const signupRes = await fetch(`${baseUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
      });

      if (!signupRes.ok) {
        // Surface backend error if possible
        let msg = `Signup failed (${signupRes.status})`;
        try {
          const errBody = await signupRes.json();
          if (errBody?.message) msg = errBody.message;
        } catch {}
        throw new Error(msg);
      }

      // If signup returns a token, store it; otherwise try to sign in immediately to obtain a token
      try {
        const signupData = await signupRes.json();
        if (signupData?.token && typeof window !== "undefined") {
          localStorage.setItem("lifestage_token", signupData.token);
        }
        if (signupData?.user && typeof window !== "undefined") {
          localStorage.setItem("lifestage_user", JSON.stringify(signupData.user));
        }
      } catch {
        // ignore parse errors
      }

      // If no token yet, attempt to sign in to get one
      if (typeof window !== "undefined" && !localStorage.getItem("lifestage_token")) {
        try {
          const signinRes = await fetch(`${baseUrl}/api/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (signinRes.ok) {
            const signinData = await signinRes.json();
            if (signinData?.token) localStorage.setItem("lifestage_token", signinData.token);
          }
        } catch {
          // ignore signin network errors
        }
      }

      // Use onboarding answers to request plan. If we have a token, include it.
      if (!onboarding) throw new Error("Onboarding data not found");

      const planHeaders: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("lifestage_token") : null;
      if (token) planHeaders["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/plan`, {
        method: "POST",
        headers: planHeaders,
        body: JSON.stringify(onboarding),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("lifestage_plan", JSON.stringify(data));
      }
      router.push("/plan");
    } catch (err: any) {
      setError(err.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-4">Create an account</h1>
          <p className="text-sm text-gray-600 mb-4">You need an account to view your personalized plan.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">First name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? "Creating account..." : "Create account & generate plan"}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-sm text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
