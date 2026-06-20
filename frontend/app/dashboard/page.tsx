"use client";
import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const { user } = useUser();
  const [totalScans, setTotalScans] = useState(0);
  const [safeUrls, setSafeUrls] = useState(0);
  const [threats, setThreats] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const { data } = await supabase
      .from("scan_history")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    if (data) {
      setHistory(data);
      setTotalScans(data.length);
      setSafeUrls(data.filter((s) => s.risk_level === "LOW").length);
      setThreats(data.filter((s) => s.risk_level === "HIGH").length);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-green-400 font-bold text-xl">Phishing Detector</h1>
        <UserButton />
      </nav>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-400 mb-2">Total Scans</p>
            <p className="text-4xl font-bold text-green-400">{totalScans}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-400 mb-2">Safe URLs</p>
            <p className="text-4xl font-bold text-blue-400">{safeUrls}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-400 mb-2">Threats Found</p>
            <p className="text-4xl font-bold text-red-400">{threats}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link href="/scanner" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition">
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-xl font-semibold text-green-400 mb-2">URL Scanner</h3>
            <p className="text-gray-400">Paste a suspicious URL to check if it is safe</p>
          </Link>
          <Link href="/email-analyzer" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="text-xl font-semibold text-green-400 mb-2">Email Analyzer</h3>
            <p className="text-gray-400">Paste suspicious email content for analysis</p>
          </Link>
        </div>
        <h3 className="text-2xl font-bold mb-4">Scan History</h3>
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {history.length === 0 ? (
            <p className="text-gray-400 p-6">No scans yet. Start scanning!</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-300">Type</th>
                  <th className="text-left px-6 py-3 text-gray-300">Content</th>
                  <th className="text-left px-6 py-3 text-gray-300">Risk</th>
                  <th className="text-left px-6 py-3 text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((scan) => (
                  <tr key={scan.id} className="border-t border-gray-700">
                    <td className="px-6 py-3 capitalize">{scan.scan_type}</td>
                    <td className="px-6 py-3 text-gray-400 truncate max-w-xs">{scan.content}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${scan.risk_level === "HIGH" ? "bg-red-800 text-red-200" : scan.risk_level === "MEDIUM" ? "bg-yellow-800 text-yellow-200" : "bg-green-800 text-green-200"}`}>{scan.risk_level}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{new Date(scan.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}