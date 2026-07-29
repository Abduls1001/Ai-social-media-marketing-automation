import {
  getGeminiClient,
  MissingGeminiKeyError,
  GEMINI_CAPTION_MODEL,
} from "@/lib/ai/gemini-client";
import {
  buildCaptionPrompt,
  type CaptionPromptContext,
} from "@/lib/ai/caption-prompts";

export interface GenerateCaptionResult {
  caption: string | null;
  error: string | null;
}

/**
 * Phase 7 — AI Content Generation.
 *
 * Reusable AI service: turns Post / Content Task / Campaign / Client
 * context into a single generated caption via the Google Gemini API.
 *
 * This is the only function in the app that calls Gemini — both
 * "Generate AI Caption" and "Regenerate Caption" (from
 * `lib/supabase/post-ai-actions.ts`) call this same service, so there
 * is no duplicated API-call code between them.
 *
 * (Previously called OpenAI's Chat Completions API — swapped to Gemini
 * behind this exact same function name and `GenerateCaptionResult`
 * shape, so `post-ai-actions.ts` and the UI needed no changes.)
 */
export async function generateCaptionWithAI(
  context: CaptionPromptContext
): Promise<GenerateCaptionResult> {
  try {
    const client = getGeminiClient();
    const prompt = buildCaptionPrompt(context);

    const response = await client.models.generateContent({
      model: GEMINI_CAPTION_MODEL,
      contents: prompt.user,
      config: {
        systemInstruction: prompt.system,
        temperature: 0.8,
      },
    });

    const caption = response.text?.trim();

    if (!caption) {
      return {
        caption: null,
        error: "The AI didn't return a caption. Please try again.",
      };
    }

    return { caption, error: null };
  } catch (caughtError) {
    if (caughtError instanceof MissingGeminiKeyError) {
      return {
        caption: null,
        error: "AI caption generation isn't configured yet. Set GEMINI_API_KEY.",
      };
    }

    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Something went wrong while generating the caption.";

    return { caption: null, error: message };
  }
}
