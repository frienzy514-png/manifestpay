export type JsonObject = Record<string, any>;

export interface JsonCompletionRequest {
  /** Instructions for the model, including a description of the expected JSON shape. */
  system: string;
  user: string;
}

/**
 * A backend that can turn a prompt into a JSON object. Verification and
 * invoicing depend only on this interface, so new backends (local models,
 * custom verifiers) can be added without touching those services.
 */
export interface LLMProvider {
  readonly name: string;
  completeJson(request: JsonCompletionRequest): Promise<JsonObject>;
}
