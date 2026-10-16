export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const DEFAULT_MODEL = "openai/gpt-5.4-mini";

export function translationModelOptions(model: string) {
    return model === DEFAULT_MODEL ? { reasoning: { effort: "none" as const } } : {};
}
