'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Advice {
  title: string;
  description: string;
}

interface PlanResponse {
  steps: Advice[];
}

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanResponse | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lifestage_plan');
      if (stored) {
        try {
          setPlan(JSON.parse(stored));
        } catch {
          setPlan(null);
        }
      }
    }
  }, []);

  if (!plan) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">No plan found</h1>
          <p className="mb-6">
            Please complete the questionnaire to receive your plan.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Start Questionnaire
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Your Personalized Financial Plan
        </h1>
        <ol className="space-y-4 list-decimal list-inside">
          {plan.steps.map((step, idx) => (
            <li key={idx} className="bg-white shadow rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-2">{step.title}</h2>
              <p className="text-gray-700">{step.description}</p>
            </li>
          ))}
        </ol>
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}