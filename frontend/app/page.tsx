import Link from 'next/link';
import GetStartedButton from './components/GetStartedButton';
import HeroCTA from './components/HeroCTA';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-start w-full">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">LifeStage Finance</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6">
              Simple, actionable financial guidance tailored to your current life stage. Build habits,
              set goals, and track progress with clarity.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <HeroCTA />
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80"
              alt="Person working on finances"
              className="w-full max-w-md rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feature section 1: text left, image right */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold mb-3">Personalized guidance</h2>
            <p className="text-gray-600 mb-4">
              We give recommendations that match your life events — whether you're starting a career,
              growing a family, or planning retirement.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Actionable step-by-step plans</li>
              <li>Simple visuals to track progress</li>
              <li>Privacy-first approach</li>
            </ul>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              alt="Charts and graphs on a laptop"
              className="w-full max-w-lg rounded-lg shadow-md object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feature section 2: image left, text right (reversed on md) */}
      <section className="w-full bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold mb-3">Track your progress</h2>
            <p className="text-gray-600 mb-4">
              Keep a simple, clear view of your financial picture. Small consistent steps compound
              into long-term wins.
            </p>
            <p className="text-gray-600">Connect accounts securely, set targets, and celebrate milestones.</p>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80"
              alt="Person reviewing charts on a tablet"
              className="w-full max-w-lg rounded-lg shadow-md object-cover"
            />
          </div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="w-full max-w-6xl mx-auto px-4 py-12 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeStage Finance
      </div>
    </main>
  );
}