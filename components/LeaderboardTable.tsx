"use client";

import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import Link from "next/link";

type LeaderboardResult = {
  id: string;
  name: string;
  class_name: string | null;
  signature_html: string | null;
  text_id: string;
  wpm: number | string;
  accuracy: number | string;
  time_seconds: number | string;
  correct_chars: number;
  total_chars: number;
  created_at: string;
};

export default function LeaderboardTable() {
  const [results, setResults] = useState<LeaderboardResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classFilter, setClassFilter] = useState("");

  async function loadLeaderboard(selectedClass = "") {
    try {
      setLoading(true);
      setError("");

      const query = selectedClass
        ? `?class=${encodeURIComponent(selectedClass)}`
        : "";

      const response = await fetch(`/api/leaderboard${query}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load leaderboard.");
      }

      setResults(data.results ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load leaderboard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const classOptions = useMemo(() => {
    const set = new Set<string>();

    for (const result of results) {
      if (result.class_name) {
        set.add(result.class_name);
      }
    }

    return Array.from(set).sort();
  }, [results]);

  function handleClassFilterChange(value: string) {
    setClassFilter(value);
    loadLeaderboard(value);
  }

  function formatDate(value: string) {
    const date = new Date(value);

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Zeolym Typing Race Leaderboard
            </h1>
            <p className="mt-3 text-slate-600">
              Top 100 results sorted by speed, accuracy, and time.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-center font-semibold text-white hover:bg-slate-700"
          >
            Back to Race
          </Link>
        </section>

        <section className="mb-6 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500">
                Total Records
              </div>
              <div className="text-3xl font-bold">{results.length}</div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={classFilter}
                onChange={(e) => handleClassFilterChange(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="">All Classes</option>
                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>

              <button
                onClick={() => loadLeaderboard(classFilter)}
                className="rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        {loading && (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm">
            Loading leaderboard...
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-red-50 p-8 text-center font-medium text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm">
            No results yet.
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-4 py-4">Rank</th>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Class</th>
                    <th className="px-4 py-4">WPM</th>
                    <th className="px-4 py-4">Accuracy</th>
                    <th className="px-4 py-4">Time</th>
                    <th className="px-4 py-4">Signature</th>
                    <th className="px-4 py-4">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result, index) => {
                    const wpm = Number(result.wpm);
                    const accuracy = Number(result.accuracy);
                    const timeSeconds = Number(result.time_seconds);
                    const safeSignature = DOMPurify.sanitize(
                      result.signature_html ?? "",
                    );

                    return (
                      <tr
                        key={result.id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-4 py-4">
                          <span
                            className={
                              index === 0
                                ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 font-bold text-yellow-700"
                                : index === 1
                                  ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700"
                                  : index === 2
                                    ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700"
                                    : "font-semibold text-slate-700"
                            }
                          >
                            {index + 1}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-bold text-slate-900">
                          {result.name}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {result.class_name || "-"}
                        </td>

                        <td className="px-4 py-4 text-xl font-bold">
                          {Math.round(wpm)}
                        </td>

                        <td className="px-4 py-4">
                          {accuracy.toFixed(1)}%
                        </td>

                        <td className="px-4 py-4">
                          {timeSeconds.toFixed(1)}s
                        </td>

                        <td className="max-w-xs px-4 py-4 text-sm text-slate-700">
                          <div
                            className="leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: safeSignature,
                            }}
                          />
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-500">
                          {formatDate(result.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}