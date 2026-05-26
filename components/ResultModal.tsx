"use client";

import { useState } from "react";
import DOMPurify from "dompurify";
import RichTextSignature from "./RichTextSignature";

export type ResultSubmission = {
  name: string;
  className: string;
  signatureHtml: string;
};

type ResultModalProps = {
  wpm: number;
  accuracy: number;
  elapsedTime: number;
  onClose: () => void;
  onSubmit: (data: ResultSubmission) => Promise<void>;
};

export default function ResultModal({
  wpm,
  accuracy,
  elapsedTime,
  onClose,
  onSubmit,
}: ResultModalProps) {
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [signatureHtml, setSignatureHtml] = useState(
    "<p>I finished the Zeolym Typing Race! 🔥</p>",
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    const safeSignatureHtml = DOMPurify.sanitize(signatureHtml);

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: trimmedName,
        className: className.trim(),
        signatureHtml: safeSignatureHtml,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Submit Your Result
            </h2>
            <p className="mt-1 text-slate-600">
              Add your name, class, and personal signature to enter the
              leaderboard.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-lg font-bold text-slate-600 hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <div className="text-xs text-slate-500">WPM</div>
            <div className="text-2xl font-bold">{Math.round(wpm)}</div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <div className="text-xs text-slate-500">Accuracy</div>
            <div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <div className="text-xs text-slate-500">Time</div>
            <div className="text-2xl font-bold">{elapsedTime.toFixed(1)}s</div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Example: Alex ⚡"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-slate-900"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Class
            </span>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Example: G9A"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-slate-900"
            />
          </label>

          <div>
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Personal Signature
            </span>
            <RichTextSignature
              value={signatureHtml}
              onChange={setSignatureHtml}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-lg font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:hover:bg-slate-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Result"}
          </button>
        </div>
      </div>
    </div>
  );
}
