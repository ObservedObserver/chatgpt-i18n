import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { CommonStore } from "../src/store/common";
import { createChatCompletion } from "../src/utils/index";
import { DEFAULT_MODEL } from "../lib/ai-config";
import { createTranslationClient } from "../lib/openrouter";
import translate from "../api/translate";
import fastTranslate from "../api/fastTranslate";
import exportLocalFiles from "../api/exportLocalFiles";

const originalFetch = globalThis.fetch;
const originalStorage = globalThis.localStorage;
const originalKey = process.env.OPENROUTER_API_KEY;
const originalModel = process.env.OPENROUTER_MODEL;
afterEach(() => {
    globalThis.fetch = originalFetch;
    Object.defineProperty(globalThis, "localStorage", { value: originalStorage, configurable: true });
    for (const [key, value] of Object.entries({ OPENROUTER_API_KEY: originalKey, OPENROUTER_MODEL: originalModel })) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }
});

function storage(config: object) {
    let saved = JSON.stringify(config);
    Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } },
    });
    return () => JSON.parse(saved);
}

function mockCompletion(content: string) {
    const calls: { url: string; headers: Headers; body: any }[] = [];
    globalThis.fetch = async (input, init) => {
        const request = new Request(input, init);
        calls.push({ url: request.url, headers: request.headers, body: await request.json() });
        return Response.json({ id: "test", object: "chat.completion", created: 0, model: DEFAULT_MODEL,
            choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }] });
    };
    return calls;
}

async function callHandler(handler: typeof translate, body: object) {
    let status = 200;
    let result: any;
    const response = { status(code: number) { status = code; return this; }, json(data: unknown) { result = data; } };
    await handler({ body } as any, response as any);
    assert.equal(status, 200);
    assert.equal(result.success, true);
    return result.data;
}

test("legacy OpenAI settings migrate without forwarding the old key", () => {
    const saved = storage({ serviceProvider: "openai", apiKey: "legacy-secret", model: "gpt-3.5-turbo" });
    const store = new CommonStore();
    store.loadConfig();
    assert.equal(store.config.serviceProvider, "openrouter");
    assert.equal(store.config.model, DEFAULT_MODEL);
    assert.equal(store.config.apiKey, "");
    assert.equal(saved().apiKey, "");
});

test("old OpenRouter model upgrades while custom models and Azure settings survive", () => {
    for (const [provider, model, expected] of [
        ["openrouter", "openai/gpt-3.5-turbo", DEFAULT_MODEL],
        ["openrouter", "openai/gpt-4.1", "openai/gpt-4.1"],
        ["azure", "gpt-3.5-turbo-0301", "gpt-3.5-turbo-0301"],
    ]) {
        storage({ serviceProvider: provider, apiKey: "saved-key", model });
        const store = new CommonStore();
        store.loadConfig();
        assert.equal(store.config.serviceProvider, provider);
        assert.equal(store.config.model, expected);
        assert.equal(store.config.apiKey, "saved-key");
    }
});

test("browser sends OpenRouter credentials, chosen model and reasoning settings", async () => {
    const calls = mockCompletion('["你好"]');
    const config = { ...new CommonStore().config, apiKey: "router-key" };
    const response = await createChatCompletion({ model: DEFAULT_MODEL, messages: [{ role: "user", content: "hello" }] }, config);
    assert.equal(response.choices[0].message.content, '["你好"]');
    assert.equal(calls[0].url, "https://openrouter.ai/api/v1/chat/completions");
    assert.equal(calls[0].headers.get("authorization"), "Bearer router-key");
    assert.equal(calls[0].body.model, DEFAULT_MODEL);
    assert.equal(calls[0].body.reasoning?.effort, "none");
    assert.equal(calls[0].body.temperature, undefined);
});

test("Azure request still uses deployment routing and api-key authentication", async () => {
    const calls = mockCompletion("hello");
    const config = { ...new CommonStore().config, serviceProvider: "azure", apiKey: "azure-key",
        baseURL: "https://example.openai.azure.com", deployName: "translation", model: "azure-model" };
    await createChatCompletion({ model: config.model, messages: [] }, config);
    assert.equal(calls[0].url, "https://example.openai.azure.com/openai/deployments/translation/chat/completions?api-version=2023-03-15-preview");
    assert.equal(calls[0].headers.get("api-key"), "azure-key");
    assert.equal(calls[0].headers.get("authorization"), null);
    assert.equal(calls[0].body.reasoning?.effort, undefined);
    assert.equal(calls[0].body.temperature, 0);
});

test("missing keys and unmigrated providers fail before network requests", async () => {
    const calls = mockCompletion("unused");
    const config = new CommonStore().config;
    await assert.rejects(createChatCompletion({ model: DEFAULT_MODEL, messages: [] }, config), /API key/);
    await assert.rejects(createChatCompletion({ model: DEFAULT_MODEL, messages: [] }, { ...config, serviceProvider: "openai", apiKey: "old" }), /select OpenRouter/);
    delete process.env.OPENROUTER_API_KEY;
    assert.throws(createTranslationClient, /OPENROUTER_API_KEY/);
    assert.equal(calls.length, 0);
});

for (const [name, handler, reply, body, expected] of [
    ["translate", translate, '{"hello":"你好"}', { content: '{"hello":"Hello"}', targetLang: "Chinese" }, '{"hello":"你好"}'],
    ["fastTranslate", fastTranslate, '["你好"]', { content: '{"hello":"Hello"}', targetLang: "Chinese" }, '{"hello":"你好"}'],
    ["exportLocalFiles", exportLocalFiles, '{"hello":"你好"}', { content: '{"hello":"Hello"}', langList: ["Chinese"] }, [{ lang: "Chinese", content: '{"hello":"你好"}' }]],
] as const) {
    test(`${name} uses the new SDK response shape and OpenRouter model`, async () => {
        process.env.OPENROUTER_API_KEY = "server-router-key";
        delete process.env.OPENROUTER_MODEL;
        const calls = mockCompletion(reply);
        assert.deepEqual(await callHandler(handler, body), expected);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "https://openrouter.ai/api/v1/chat/completions");
        assert.equal(calls[0].headers.get("authorization"), "Bearer server-router-key");
        assert.equal(calls[0].body.model, DEFAULT_MODEL);
        assert.equal(calls[0].body.reasoning?.effort, "none");
    });
}

test("backend honors an explicit model override without default-model parameters", async () => {
    process.env.OPENROUTER_API_KEY = "server-router-key";
    process.env.OPENROUTER_MODEL = "openai/gpt-4.1";
    const calls = mockCompletion('{"hello":"你好"}');
    await callHandler(translate, { content: '{"hello":"Hello"}', targetLang: "Chinese" });
    assert.equal(calls[0].body.model, "openai/gpt-4.1");
    assert.equal(calls[0].body.reasoning?.effort, undefined);
});

test("chunked translation preserves order through the new SDK", async () => {
    process.env.OPENROUTER_API_KEY = "server-router-key";
    delete process.env.OPENROUTER_MODEL;
    const calls = mockCompletion('["翻译"]');
    const result = await callHandler(fastTranslate, {
        content: JSON.stringify({ first: "a".repeat(1000), last: "Hello" }), targetLang: "Chinese",
    });
    assert.deepEqual(JSON.parse(result), { first: "翻译", last: "翻译" });
    assert.equal(calls.length, 2);
    for (const call of calls) assert.equal(call.body.model, DEFAULT_MODEL);
});

test("browser rejects failed upstream requests", async () => {
    globalThis.fetch = async () => Response.json({ error: { message: "Invalid key" } }, { status: 401 });
    await assert.rejects(createChatCompletion({ model: DEFAULT_MODEL, messages: [] }, {
        ...new CommonStore().config, apiKey: "invalid-key",
    }), /failed to create chat completion/);
});
