/**
 * Phase 7 — AI Content Generation.
 *
 * Prompt templates for AI caption generation, one per supported
 * platform (Instagram, Facebook, LinkedIn, X). Kept separate from
 * `caption-service.ts` (the Gemini call itself) so new platforms or
 * tone tweaks can be added without touching the service, and separate
 * from `lib/supabase/post-ai-actions.ts` (the Server Action) so this
 * stays a plain, dependency-free function — no Supabase, no
 * "use server".
 */

export interface CaptionPromptContext {
  postTitle: string;
  platform: string;
  contentTaskTitle: string;
  contentTaskDescription: string | null;
  contentType: string;
  priority: string;
  campaignName: string | null;
  campaignObjective: string | null;
  clientName: string | null;
  clientIndustry: string | null;
}

interface PlatformGuidance {
  label: string;
  guidance: string;
}

/** Tone/format guidance per platform, keyed by the lowercase POST_PLATFORMS value. */
const PLATFORM_GUIDANCE: Record<string, PlatformGuidance> = {
  instagram: {
    label: "Instagram",
    guidance:
      "Write a warm, visual, scroll-stopping caption: a strong hook in the first line, a conversational tone, light emoji use where it feels natural, and 3-6 relevant hashtags at the end.",
  },
  facebook: {
    label: "Facebook",
    guidance:
      "Write a friendly, community-oriented caption that invites comments or discussion. Slightly longer and more conversational than Instagram, minimal or no hashtags, and a clear call to action.",
  },
  linkedin: {
    label: "LinkedIn",
    guidance:
      "Write a professional, value-driven caption for a business audience: lead with an insight or takeaway, avoid casual slang and emoji, and close with a thoughtful question or call to action. At most 1-3 relevant hashtags.",
  },
  x: {
    label: "X (Twitter)",
    guidance:
      "Write a short, punchy caption that fits comfortably under 280 characters. One clear idea, a conversational tone, and at most 1-2 hashtags.",
  },
};

const DEFAULT_GUIDANCE: PlatformGuidance = {
  label: "the target platform",
  guidance:
    "Write a clear, engaging caption suited to a general social media audience.",
};

function guidanceForPlatform(platform: string): PlatformGuidance {
  return PLATFORM_GUIDANCE[platform.trim().toLowerCase()] ?? DEFAULT_GUIDANCE;
}

export interface CaptionPrompt {
  system: string;
  user: string;
}

/**
 * Builds the system/user prompt pair sent to Gemini. Automatically
 * pulls in every piece of related context already available on the
 * Post -> Content Task -> Campaign -> Client chain, so the caller only
 * has to assemble a `CaptionPromptContext` from data it already fetched.
 */
export function buildCaptionPrompt(
  context: CaptionPromptContext
): CaptionPrompt {
  const platform = guidanceForPlatform(context.platform);

  const system = [
    "You are a senior social media copywriter working inside a marketing agency's content platform.",
    `You are writing a caption exclusively for ${platform.label}. ${platform.guidance}`,
    "Write only the caption text itself — no explanations, no labels, no surrounding quotation marks.",
  ].join(" ");

  const contextLines = [
    `Post title: ${context.postTitle}`,
    `Platform: ${platform.label}`,
    `Content task: ${context.contentTaskTitle}`,
    context.contentTaskDescription
      ? `Content task brief: ${context.contentTaskDescription}`
      : null,
    `Content type: ${context.contentType}`,
    `Priority: ${context.priority}`,
    context.campaignName ? `Campaign: ${context.campaignName}` : null,
    context.campaignObjective
      ? `Campaign objective: ${context.campaignObjective}`
      : null,
    context.clientName ? `Client: ${context.clientName}` : null,
    context.clientIndustry
      ? `Client industry: ${context.clientIndustry}`
      : null,
  ].filter((line): line is string => Boolean(line));

  const user = [
    "Generate one social media caption using the following context:",
    "",
    ...contextLines,
    "",
    "Return only the caption.",
  ].join("\n");

  return { system, user };
}
