import { NextResponse } from "next/server";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { sendContactEmail } from "@/lib/contact";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateContactForm } from "@/lib/validation";
/** Max JSON body size — prevents oversized payloads */
const MAX_BODY_BYTES = 10_240;

/** Dev / best-effort limit: 5 submissions per IP per hour */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

function parseJsonBody(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { ok: false, error: "Invalid request." },
        { status: 415 },
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Request too large." },
        { status: 413 },
      );
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Request too large." },
        { status: 413 },
      );
    }

    const body = parseJsonBody(raw);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid request." },
        { status: 400 },
      );
    }

    const locale: Locale =
      typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "en";
    const dict = getDictionary(locale);

    const ip = getClientIp(request);
    const rate = checkRateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!rate.ok) {
      return NextResponse.json(
        { ok: false, error: dict.validation.rateLimited },
        {
          status: 429,
          headers: rate.retryAfterSec
            ? { "Retry-After": String(rate.retryAfterSec) }
            : undefined,
        },
      );
    }

    const validation = validateContactForm(body, locale);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, errors: validation.errors },
        { status: 400 },
      );
    }

    const result = await sendContactEmail(validation.data);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: dict.validation.unavailable },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      ...(process.env.NODE_ENV !== "production" && result.message
        ? { devNote: result.message }
        : {}),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }
}
