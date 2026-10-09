import { config, type Env } from '../../config/env.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { OpenAIProvider } from './providers/openai.js';
import type { LLMProvider } from './types.js';

export type { JsonCompletionRequest, JsonObject, LLMProvider } from './types.js';
export { AnthropicProvider } from './providers/anthropic.js';
export { OpenAIProvider } from './providers/openai.js';

let provider: LLMProvider | null = null;

function createProvider(env: Env): LLMProvider {
  switch (env.AI_PROVIDER) {
    case 'anthropic':
      return new AnthropicProvider(env.ANTHROPIC_API_KEY!, env.AI_MODEL);
    case 'openai':
      return new OpenAIProvider(env.OPENAI_API_KEY!, env.AI_MODEL);
  }
}

/** Returns the provider selected by AI_PROVIDER, created on first use. */
export function getLLMProvider(): LLMProvider {
  if (!provider) {
    provider = createProvider(config());
  }
  return provider;
}

/** Overrides the active provider (custom backends, tests). Pass null to reset. */
export function setLLMProvider(next: LLMProvider | null): void {
  provider = next;
}
