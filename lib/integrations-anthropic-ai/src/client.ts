import Anthropic from "@anthropic-ai/sdk";

if (!process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL) {
  console.warn("WARNING: AI_INTEGRATIONS_ANTHROPIC_BASE_URL is not set. AI features will fail.");
}

export const anthropicUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || "http://localhost:11434";

if (!process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
  console.warn("WARNING: AI_INTEGRATIONS_ANTHROPIC_API_KEY is not set.");
}

export const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || "dummy",
  baseURL: anthropicUrl,
});
