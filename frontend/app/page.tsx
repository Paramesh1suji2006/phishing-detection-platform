import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-green-400 mb-4">
          🛡️ Phishing Detection Platform
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl">
          Protect yourself from phishing attacks. Scan suspicious URLs and
          emails instantly using AI-powered detection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🔗</div>
          <h2 className="text-xl font-semibold text-green-400 mb-2">URL Scanner</h2>
          <p className="text-gray-400">Check if a website link is safe or malicious</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">📧</div>
          <h2 className="text-xl font-semibold text-green-400 mb-2">Email Analyzer</h2>
          <p className="text-gray-400">Detect phishing attempts in suspicious emails</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-xl font-semibold text-green-400 mb-2">Risk Reports</h2>
          <p className="text-gray-400">Get detailed threat analysis and risk scores</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/sign-up" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition">
          Get Started
        </Link>
        <Link href="/sign-in" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg transition">
          Login
        </Link>
      </div>
    </main>
  );
}