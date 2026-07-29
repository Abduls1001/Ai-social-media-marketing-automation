import { GoogleGenAI } from "@google/genai";

/**
 * Phase 7 — AI Content Generation.
 *
 * Single shared Gemini client for the whole app. Created lazily (on
 * first use, not at module load) so a missing `GEMINI_API_KEY` only
 * breaks the AI generation call path itself, not the whole app or the
 * build — mirrors the lazy-client pattern already used by
 * `lib/supabase/server.ts` / `lib/supabase/client.ts`.
 *
 * This is the ONLY place in the app that constructs a Gemini client.
 * Anything that needs to call Gemini (currently just
 * `lib/ai/caption-service.ts`) should import `getGeminiClient` from
 * here instead of instantiating its own — same "one shared client"
 * discipline as `lib/supabase/server.ts`.
 *
 * (Previously this file wrapped the OpenAI SDK — replaced with
 * Google's official `@google/genai` SDK. Nothing outside `lib/ai/`
 * imports this file directly, so the swap has no effect on
 * `lib/supabase/post-ai-actions.ts` or the UI.)
 */

let cachedClient: GoogleGenAI | null = null;

/** Thrown by `getGeminiClient` when `GEMINI_API_KEY` isn't configured. */
export class MissingGeminiKeyError extends Error {
  constructor() {
    super("GEMINI_API_KEY is not set.");
    this.name = "MissingGeminiKeyError";
  }
}

export function getGeminiClient(): GoogleGenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new MissingGeminiKeyError();
  }

  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

/**
 * Chat model used for caption generation. Overridable via
 * `GEMINI_MODEL` (e.g. to point at a different model) without a code
 * change; defaults to a fast, inexpensive model since captions are
 * short, latency-sensitive generations.
 */
export const GEMINI_CAPTION_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
