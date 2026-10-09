import OpenAI from 'openai';
import type { JsonCompletionRequest, JsonObject, LLMProvider } from '../types.js';

const DEFAULT_MODEL = 'gpt-4o-mini';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  private readonly client: OpenAI;

  constructor(apiKey: string, private readonly model: string = DEFAULT_MODEL) {
    this.client = new OpenAI({ apiKey });
  }

  async completeJson(request: JsonCompletionRequest): Promise<JsonObject> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: request.system },
        { role: 'user', content: request.user },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }
}
