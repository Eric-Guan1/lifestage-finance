import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          LifeStage Finance
        </h1>
        <p className="mb-8 text-lg sm:text-xl text-gray-600">
          Get simple, actionable financial guidance tailored to where you are in life.
        </p>
        <Link
          href="/onboarding"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
        >
          Start Now
        </Link>
      </div>
    </main>
  );
}