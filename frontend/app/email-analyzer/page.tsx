"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/nextjs";

export default function EmailAnalyzer() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const analyzeEmail = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/analyze-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: email }),
      });
      const data = await res.json();
      setResult(data);

      // Save to Supabase
      await supabase.from("scan_history").insert({
        user_id: user?.id,
        scan_type: "email",
        content: email,
        result: data.status,
        risk_level: data.risk_level,
      });

    } catch (error) {
      setResult({ error: "Failed to connect to server" });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-green-400 font-bold text-xl">🛡️ Phishing Detector</h1>
        <Link href="/dashboard" className="text-gray-400 hover:text-white">← Back to Dashboard</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold mb-2">📧 Email Analyzer</h2>
        <p className="text-gray-400 mb-8">Paste suspicious email content below to analyze it</p>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <textarea
            placeholder="Paste your suspicious email content here..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            rows={6}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
          <button
            onClick={analyzeEmail}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Analyzing..." : "Analyze Email"}
          </button>
        </div>

        {result && (
          <div className={`rounded-xl p-6 ${result.risk_level === "HIGH" ? "bg-red-900" : result.risk_level === "MEDIUM" ? "bg-yellow-900" : "bg-green-900"}`}>
            <h3 className="text-xl font-bold mb-4">Analysis Result</h3>
            <p><span className="text-gray-300">Risk Level:</span> <span className="font-bold">{result.risk_level}</span></p>
            <p><span className="text-gray-300">Status:</span> {result.status}</p>
            <p><span className="text-gray-300">Recommendation:</span> {result.recommendation}</p>
            {result.flags && result.flags.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-300 mb-2">Suspicious Patterns Found:</p>
                <ul className="list-disc list-inside">
                  {result.flags.map((flag: string, i: number) => (
                    <li key={i} className="text-yellow-300">{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}