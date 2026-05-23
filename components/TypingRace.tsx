"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { TYPING_TEXT, TYPING_TEXT_ID } from "@/lib/typingText";
import ResultModal, { ResultSubmission } from "./ResultModal";

type RaceStatus = "idle" | "countdown" | "running" | "finished";

export default function TypingRace() {
  const [status, setStatus] = useState<RaceStatus>("idle");
  const [countdown, setCountdown] = useState(3);
  const [typedText, setTypedText] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [submittedResult, setSubmittedResult] =
    useState<ResultSubmission | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const totalChars = TYPING_TEXT.length;

  const correctChars = useMemo(() => {
    let count = 0;

    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === TYPING_TEXT[i]) {
        count++;
      }
    }

    return count;
  }, [typedText]);

  const accuracy =
    typedText.length === 0 ? 100 : (correctChars / typedText.length) * 100;

  const wpm = elapsedTime > 0 ? correctChars / 5 / (elapsedTime / 60) : 0;

  const progress = Math.min((typedText.length / totalChars) * 100, 100);

  function startRace() {
    setTypedText("");
    setElapsedTime(0);
    setCountdown(3);
    setStatus("countdown");
    setShowResultModal(false);
    setSubmittedResult(null);
    startTimeRef.current = null;
  }

  useEffect(() => {
    if (status !== "countdown") return;

    if (countdown === 0) {
      setStatus("running");
      startTimeRef.current = performance.now();

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, countdown]);

  useEffect(() => {
    if (status !== "running") return;

    const timer = setInterval(() => {
      if (startTimeRef.current) {
        const seconds = (performance.now() - startTimeRef.current) / 1000;
        setElapsedTime(seconds);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [status]);

  function handleChange(value: string) {
    if (status !== "running") return;

    if (value.length > TYPING_TEXT.length) return;

    setTypedText(value);

    if (value.length === TYPING_TEXT.length) {
      if (startTimeRef.current) {
        const finalSeconds =
          (performance.now() - startTimeRef.current) / 1000;
        setElapsedTime(finalSeconds);
      }

      setStatus("finished");
      setShowResultModal(true);
    }
  }

//   function handleSubmitResult(data: ResultSubmission) {
//     setSubmittedResult(data);
//     setShowResultModal(false);
//   }
async function handleSubmitResult(data: ResultSubmission) {
  try {
    const response = await fetch("/api/submit-result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        className: data.className,
        signatureHtml: data.signatureHtml,
        typedText,
        timeSeconds: elapsedTime,
        textId: TYPING_TEXT_ID,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Failed to submit result.");
    }

    setSubmittedResult(data);
    setShowResultModal(false);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit result.";

    alert(message);
  }
}

  function renderTypingText() {
    return TYPING_TEXT.split("").map((char, index) => {
      const typedChar = typedText[index];

      let className = "text-slate-500";

      if (typedChar != null) {
        className =
          typedChar === char
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700";
      } else if (index === typedText.length && status === "running") {
        className = "bg-blue-100 text-blue-700";
      }

      return (
        <span key={index} className={`${className} rounded px-0.5`}>
          {char}
        </span>
      );
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Zeolym Typing Race
          </h1>

          <p className="mt-3 text-slate-600">Speed. Accuracy. Focus.</p>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <div className="text-sm text-slate-500">WPM</div>
              <div className="text-3xl font-bold">{Math.round(wpm)}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <div className="text-sm text-slate-500">Accuracy</div>
              <div className="text-3xl font-bold">{accuracy.toFixed(1)}%</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <div className="text-sm text-slate-500">Time</div>
              <div className="text-3xl font-bold">
                {elapsedTime.toFixed(1)}s
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <div className="text-sm text-slate-500">Progress</div>
              <div className="text-3xl font-bold">{progress.toFixed(0)}%</div>
            </div>
          </div>

          <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg leading-loose tracking-wide whitespace-pre-wrap break-words select-none sm:p-6 sm:text-xl"
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {renderTypingText()}
          </div>

          {status === "idle" && (
            <div className="text-center">
              <button
                onClick={startRace}
                className="rounded-2xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-slate-700"
              >
                Start Race
              </button>
            </div>
          )}

          {status === "countdown" && (
            <div className="text-center text-6xl font-bold">
              {countdown === 0 ? "Go!" : countdown}
            </div>
          )}

          {(status === "running" || status === "finished") && (
            <textarea
              ref={inputRef}
              value={typedText}
              disabled={status === "finished"}
              onChange={(e) => handleChange(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              className="h-36 w-full resize-none rounded-2xl border border-slate-300 p-4 text-lg outline-none focus:border-slate-900 disabled:bg-slate-100 sm:text-xl"
              placeholder="Start typing here..."
            />
          )}

          {status === "finished" && (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center">
              <h2 className="text-2xl font-bold text-emerald-800">
                Race Finished!
              </h2>

              <p className="mt-2 text-emerald-700">
                WPM: {Math.round(wpm)} | Accuracy: {accuracy.toFixed(1)}% |
                Time: {elapsedTime.toFixed(1)}s
              </p>

              {!submittedResult && (
                <button
                  onClick={() => setShowResultModal(true)}
                  className="mt-4 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
                >
                  Submit to Leaderboard
                </button>
              )}

              {submittedResult && (
                
                <div className="mx-auto mt-5 max-w-xl rounded-2xl bg-white p-5 text-left shadow-sm">
                  <div className="text-sm font-semibold text-slate-500">
                    Local submission preview
                  </div>
<Link
    href="/leaderboard"
    className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
  >
    View Leaderboard
  </Link>
                  <div className="mt-2 text-xl font-bold text-slate-900">
                    {submittedResult.name}
                  </div>

                  {submittedResult.className && (
                    <div className="text-slate-600">
                      Class: {submittedResult.className}
                    </div>
                  )}

                  <div
                    className="prose prose-slate mt-3 max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: submittedResult.signatureHtml,
                    }}
                  />
                </div>
              )}

              <button
                onClick={startRace}
                className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-600"
              >
                Try Again
              </button>
            </div>
          )}
        </section>
      </div>

      {showResultModal && (
        <ResultModal
          wpm={wpm}
          accuracy={accuracy}
          elapsedTime={elapsedTime}
          onClose={() => setShowResultModal(false)}
          onSubmit={handleSubmitResult}
        />
      )}
    </main>
  );
}