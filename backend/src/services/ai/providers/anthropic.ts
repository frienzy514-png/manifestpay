import Anthropic from '@anthropic-ai/sdk';
import type { JsonCompletionRequest, JsonObject, LLMProvider } from '../types.js';
import { parseJsonObject } from '../parse-json.js';

const DEFAULT_MODEL = 'claude-opus-5-5';

// Models that accept output_config.effort and server-side refusal fallbacks.
const FALLBACK_CAPABLE_MODELS = new Set([
  'claude-fable-5-1',
  'claude-opus-5-5',
  'claude-opus-5',
  'claude-sonnet-5-5',
]);

export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic';
  private readonly client: Anthropic;

  constructor(apiKey: string, private readonly model: string = DEFAULT_MODEL) {
    this.client = new Anthropic({ apiKey });
  }

  async completeJson(request: JsonCompletionRequest): Promise<JsonObject> {
    const params = {
      model: this.model,
      max_tokens: 16000,
      system: `${request.system}\n\nRespond with a single JSON object and nothing else.`,
      messages: [{ role: 'user' as const, content: request.user }],
    };

    const response = FALLBACK_CAPABLE_MODELS.has(this.model)
      ? await this.client.beta.messages.create({
          ...params,
          output_config: { effort: 'medium' },
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        })
      : await this.client.beta.messages.create(params);

    if (response.stop_reason === 'refusal') {
      throw new Error(`Anthropic model declined the request (${response.stop_details?.category ?? 'unknown'})`);
    }

    const text = response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('');
    return parseJsonObject(text);
  }
}
