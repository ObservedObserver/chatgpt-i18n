import OpenAI from "openai";
import { DEFAULT_MODEL, OPENROUTER_BASE_URL, translationModelOptions } from "./ai-config.js";

export function createTranslationClient() {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is required");
    }
    return new OpenAI({
        apiKey,
        baseURL: OPENROUTER_BASE_URL,
        timeout: 60_000,
        maxRetries: 0,
    });
}

export function translationModel() {
    const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
    return { model, ...translationModelOptions(model) };
}
