'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    age: '',
    income: '',
    has_children: false,
    is_student: false,
    is_graduating: false,
    has_debt: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      // Build payload with parsed numbers
      const payload = {
        age: parseInt(form.age, 10),
        income: parseFloat(form.income),
        has_children: form.has_children,
        is_student: form.is_student,
        is_graduating: form.is_graduating,
        has_debt: form.has_debt,
      };
      const res = await fetch(`${baseUrl}/api/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      // Save plan in localStorage for retrieval on the plan page
      if (typeof window !== 'undefined') {
        localStorage.setItem('lifestage_plan', JSON.stringify(data));
      }
      router.push('/plan');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Tell us about yourself
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white shadow-md rounded-lg p-6"
        >
          <div>
            <label className="block mb-1 font-medium" htmlFor="age">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              min="0"
              required
              value={form.age}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="income">
              Annual income (USD)
            </label>
            <input
              id="income"
              name="income"
              type="number"
              min="0"
              step="1000"
              required
              value={form.income}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="flex items-center">
            <input
              id="has_children"
              name="has_children"
              type="checkbox"
              checked={form.has_children}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="has_children">I have children/dependents</label>
          </div>
          <div className="flex items-center">
            <input
              id="is_student"
              name="is_student"
              type="checkbox"
              checked={form.is_student}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="is_student">I am currently a student</label>
          </div>
          <div className="flex items-center">
            <input
              id="is_graduating"
              name="is_graduating"
              type="checkbox"
              checked={form.is_graduating}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="is_graduating">I am graduating soon</label>
          </div>
          <div className="flex items-center">
            <input
              id="has_debt"
              name="has_debt"
              type="checkbox"
              checked={form.has_debt}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="has_debt">I have high‑interest debt</label>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Generating plan...' : 'Get My Plan'}
          </button>
        </form>
      </div>
    </main>
  );
}