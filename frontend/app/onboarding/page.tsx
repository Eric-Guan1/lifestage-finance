"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  key: keyof OnboardingForm;
  question: string;
  options: { label: string; value: any }[];
};

type OnboardingForm = {
  age: number | null;
  income: number | null;
  has_children: boolean;
  is_student: boolean;
  is_graduating: boolean;
  has_debt: boolean;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<OnboardingForm>({
    age: null,
    income: null,
    has_children: false,
    is_student: false,
    is_graduating: false,
    has_debt: false,
  });

  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions: Question[] = [
    {
      key: "age",
      question: "What is your age range?",
      options: [
        { label: "Under 25", value: 22 },
        { label: "25–34", value: 30 },
        { label: "35–44", value: 40 },
        { label: "45 or older", value: 55 },
      ],
    },
    {
      key: "income",
      question: "Which annual income range best matches you?",
      options: [
        { label: "Under $30k", value: 25000 },
        { label: "$30k–$60k", value: 45000 },
        { label: "$60k–$100k", value: 80000 },
        { label: "$100k+", value: 150000 },
      ],
    },
    {
      key: "has_children",
      question: "Do you have children or dependents?",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    {
      key: "is_student",
      question: "Are you currently a student?",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    {
      key: "is_graduating",
      question: "Are you graduating soon?",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    {
      key: "has_debt",
      question: "Do you have high-interest debt?",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
  ];

  const isLast = index === questions.length - 1;

  const handleOption = async (value: any, key: keyof OnboardingForm) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // auto-advance
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    // final step: save onboarding answers and require signup before generating a plan
    try {
      const finalPayload = {
        age: form.age ?? (key === "age" ? Number(value) : 0),
        income: form.income ?? (key === "income" ? Number(value) : 0),
        has_children: (key === "has_children" ? Boolean(value) : form.has_children) || false,
        is_student: (key === "is_student" ? Boolean(value) : form.is_student) || false,
        is_graduating: (key === "is_graduating" ? Boolean(value) : form.is_graduating) || false,
        has_debt: (key === "has_debt" ? Boolean(value) : form.has_debt) || false,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("lifestage_onboarding", JSON.stringify(finalPayload));
      }

      // redirect to signup to require an account before generating the plan
      router.push("/signup");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    }
  };

  const handleBack = () => {
    if (index > 0) setIndex((i) => i - 1);
    else router.push("/");
  };

  const q = questions[index];

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-gray-600 hover:underline"
            >
              Back
            </button>
            <div className="text-sm text-gray-500">Question {index + 1} of {questions.length}</div>
          </div>

          <h2 className="text-xl font-semibold mb-3">{q.question}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleOption(opt.value, q.key)}
                className="rounded-md border p-4 text-left hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-pressed={form[q.key] === opt.value}
              >
                <div className="font-medium">{opt.label}</div>
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          {loading && <p className="text-gray-600 text-sm mt-4">Submitting...</p>}
        </div>
      </div>
    </main>
  );
}