"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/nextjs";

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const scanUrl = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/scan-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResult(data);

      // Save to Supabase
      await supabase.from("scan_history").insert({
        user_id: user?.id,
        scan_type: "url",
        content: url,
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
        <h2 className="text-3xl font-bold mb-2">🔗 URL Scanner</h2>
        <p className="text-gray-400 mb-8">Paste a suspicious URL below to check if it is safe</p>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <input
            type="text"
            placeholder="https://suspicious-website.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={scanUrl}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Scanning..." : "Scan URL"}
          </button>
        </div>

        {result && (
          <div className={`rounded-xl p-6 ${result.risk_level === "HIGH" ? "bg-red-900" : result.risk_level === "MEDIUM" ? "bg-yellow-900" : "bg-green-900"}`}>
            <h3 className="text-xl font-bold mb-4">Scan Result</h3>
            <p><span className="text-gray-400">URL:</span> {result.url}</p>
            <p><span className="text-gray-400">Risk Level:</span> <span className="font-bold">{result.risk_level}</span></p>
            <p><span className="text-gray-400">Status:</span> {result.status}</p>
            <p><span className="text-gray-400">Recommendation:</span> {result.recommendation}</p>
          </div>
        )}
      </div>
    </main>
  );
}