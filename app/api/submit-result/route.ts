import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TYPING_TEXT, TYPING_TEXT_ID } from "@/lib/typingText";

export const runtime = "nodejs";

type SubmitResultBody = {
  name?: string;
  className?: string;
  signatureHtml?: string;
  typedText?: string;
  timeSeconds?: number;
  textId?: string;
};

function calculateResult(typedText: string, timeSeconds: number) {
  let correctChars = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === TYPING_TEXT[i]) {
      correctChars++;
    }
  }

  const totalChars = TYPING_TEXT.length;

  const accuracy =
    typedText.length === 0 ? 0 : (correctChars / typedText.length) * 100;

  const wpm = timeSeconds > 0 ? correctChars / 5 / (timeSeconds / 60) : 0;

  return {
    correctChars,
    totalChars,
    accuracy,
    wpm,
  };
}

function cleanSignatureHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["p", "strong", "em", "u", "span", "br"],
    allowedAttributes: {
      span: ["style"],
    },
    allowedStyles: {
      span: {
        color: [
          /^#(?:[0-9a-fA-F]{3}){1,2}$/,
          /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
          /^red$/i,
          /^blue$/i,
          /^green$/i,
        ],
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitResultBody;

    const name = body.name?.trim();
    const className = body.className?.trim() ?? "";
    const signatureHtml = body.signatureHtml ?? "";
    const typedText = body.typedText ?? "";
    const timeSeconds = Number(body.timeSeconds);
    const textId = body.textId ?? TYPING_TEXT_ID;

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!typedText) {
      return NextResponse.json(
        { error: "Typed text is required." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(timeSeconds) || timeSeconds <= 0) {
      return NextResponse.json(
        { error: "Invalid timeSeconds." },
        { status: 400 },
      );
    }

    if (textId !== TYPING_TEXT_ID) {
      return NextResponse.json({ error: "Invalid textId." }, { status: 400 });
    }

    const safeSignatureHtml = cleanSignatureHtml(signatureHtml);

    const { correctChars, totalChars, accuracy, wpm } = calculateResult(
      typedText,
      timeSeconds,
    );

    const { data, error } = await supabaseAdmin
      .from("typing_results")
      .insert({
        name,
        class_name: className,
        signature_html: safeSignatureHtml,
        text_id: textId,
        typed_text: typedText,
        wpm,
        accuracy,
        time_seconds: timeSeconds,
        correct_chars: correctChars,
        total_chars: totalChars,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ result: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}