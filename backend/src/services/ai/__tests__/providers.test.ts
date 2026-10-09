import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    beta = { messages: { create: createMock } };
  },
}));

import { clearEnvCache } from '../../../config/env.js';
import { parseJsonObject } from '../parse-json.js';
import {
  AnthropicProvider,
  OpenAIProvider,
  getLLMProvider,
  setLLMProvider,
  type LLMProvider,
} from '../index.js';
import { verifyWork } from '../../verification.js';

function textResponse(text: string, stop_reason = 'end_turn') {
  return { stop_reason, stop_details: null, content: [{ type: 'text', text }] };
}

describe('parseJsonObject', () => {
  it('parses a bare JSON object', () => {
    expect(parseJsonObject('{"score": 80}')).toEqual({ score: 80 });
  });

  it('tolerates code fences and surrounding prose', () => {
    expect(parseJsonObject('Here you go:\n```json\n{"a": {"b": 1}}\n```')).toEqual({ a: { b: 1 } });
  });

  it('throws when no object is present', () => {
    expect(() => parseJsonObject('no json here')).toThrow('did not contain a JSON object');
  });
});

describe('getLLMProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    clearEnvCache();
    setLLMProvider(null);
  });

  afterEach(() => {
    process.env = originalEnv;
    clearEnvCache();
    setLLMProvider(null);
  });

  it('defaults to OpenAI', () => {
    delete process.env.AI_PROVIDER;
    process.env.OPENAI_API_KEY = 'test-openai-key';
    expect(getLLMProvider()).toBeInstanceOf(OpenAIProvider);
  });

  it('selects Anthropic when AI_PROVIDER=anthropic', () => {
    process.env.AI_PROVIDER = 'anthropic';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    delete process.env.OPENAI_API_KEY;
    expect(getLLMProvider()).toBeInstanceOf(AnthropicProvider);
  });

  it('returns an injected provider', () => {
    const custom: LLMProvider = { name: 'custom', completeJson: async () => ({}) };
    setLLMProvider(custom);
    expect(getLLMProvider()).toBe(custom);
  });
});

describe('AnthropicProvider', () => {
  beforeEach(() => createMock.mockReset());

  it('sends effort and refusal fallbacks on the default model and parses the JSON reply', async () => {
    createMock.mockResolvedValue(textResponse('{"summary": "ok"}'));

    const result = await new AnthropicProvider('key').completeJson({ system: 'sys', user: 'hi' });

    expect(result).toEqual({ summary: 'ok' });
    const params = createMock.mock.calls[0][0];
    expect(params.model).toBe('claude-opus-5-5');
    expect(params.fallbacks).toBe('default');
    expect(params.betas).toEqual(['server-side-fallback-2026-07-01']);
    expect(params.output_config).toEqual({ effort: 'medium' });
    expect(params.messages).toEqual([{ role: 'user', content: 'hi' }]);
  });

  it('omits fallbacks and effort for models that do not support them', async () => {
    createMock.mockResolvedValue(textResponse('{}'));

    await new AnthropicProvider('key', 'claude-haiku-4-5').completeJson({ system: 's', user: 'u' });

    const params = createMock.mock.calls[0][0];
    expect(params.fallbacks).toBeUndefined();
    expect(params.betas).toBeUndefined();
    expect(params.output_config).toBeUndefined();
  });

  it('throws on refusal', async () => {
    createMock.mockResolvedValue({ ...textResponse(''), stop_reason: 'refusal', stop_details: { category: 'cyber' } });

    await expect(
      new AnthropicProvider('key').completeJson({ system: 's', user: 'u' }),
    ).rejects.toThrow('declined the request (cyber)');
  });
});

describe('verifyWork with a pluggable provider', () => {
  afterEach(() => setLLMProvider(null));

  it('uses the active provider for the assessment', async () => {
    const completeJson = vi.fn().mockResolvedValue({ score: 85, summary: 'Meets requirements', details: ['tests present'] });
    setLLMProvider({ name: 'fake', completeJson });

    const result = await verifyWork({
      repositoryUrl: 'https://example.com/not-github',
      milestoneDescription: 'Implement login',
      projectId: 'proj_1',
    });

    expect(completeJson).toHaveBeenCalledOnce();
    expect(completeJson.mock.calls[0][0].user).toContain('Milestone: Implement login');
    expect(result).toMatchObject({ status: 'passed', score: 85, summary: 'Meets requirements' });
  });
});
