import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage, CreateChatCompletionResponse } from "openai";
import { buildJsonByPairs, compressValuesInJson, groupPairs } from "./utils/utils.js";
import { AxiosResponse } from "axios";
// import { buildJsonByPairs, compressValuesInJson, groupPairs } from '../lib/utils/index'

function matchJSON(str: string) {
    let start = 0;
    let end = 0;
    let stack: string[] = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === "[") {
            if (stack.length === 0) {
                start = i;
            }
            stack.push("[");
        }
        if (str[i] === "]") {
            stack.pop();
            if (stack.length === 0) {
                end = i;
                break;
            }
        }
    }
    return str.slice(start, end + 1);
}

interface IReqBody {
    content: string;
    targetLang: string;
    extraPrompt?: string;
}
export default async function handler(request: VercelRequest, response: VercelResponse) {
    const params = request.body as IReqBody;
    const { content, targetLang, extraPrompt } = params;
    try {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const locale = JSON.parse(content);
        const pairs: [string, any][] = [];
        compressValuesInJson(locale, "", pairs);

        const { requireTranslation, noTranslation } = groupPairs(pairs);
        const messages: ChatCompletionRequestMessage[] = [
            {
                role: "system",
                content: `You are a helpful assistant that translates a i18n locale array content to ${targetLang}. 
                It's a array structure, contains many strings, translate each of them and make a new array of translated strings.
                Consider all the string as a context to make better translation.\n`,
            },
        ];
        if (typeof extraPrompt === "string" && extraPrompt.length > 0) {
            messages.push({
                role: "user",
                content: `Other tips for translation: ${extraPrompt}\n
                Translate this array: \n\n\n`,
            });
        } else {
            messages.push({
                role: "user",
                content: `Translate this array: \n\n\n`,
            });
        }
        const tasks: Promise<unknown>[] = [];
        const CHUNK_SIZE = 1000;
        let chunk: string[] = [];
        let chunkSize = 0;
        let chunkIndex = 0;
        for (let i = 0; i < requireTranslation.length; i++) {
            chunk.push(requireTranslation[i][1]);
            chunkSize += requireTranslation[i][1].length;
            if (chunkSize >= CHUNK_SIZE) {
                const freezeChunk = [...chunk];

                tasks.push(
                    openai
                        .createChatCompletion({
                            model: "gpt-3.5-turbo",
                            messages: [
                                ...messages,
                                {
                                    role: "user",
                                    content: JSON.stringify(freezeChunk),
                                },
                            ],
                        })
                        .then((completion) => {
                            return matchJSON(`${completion.data.choices[0].message?.content}`);
                        })
                        .then((raw) => JSON.parse(raw) as string[])
                        .then((r) => {
                            if (r.length !== freezeChunk.length) {
                                console.log("diff ", r, freezeChunk);
                            }
                            return r;
                        })
                        .catch((err) => {
                            return freezeChunk;
                        })
                );
                chunk = [];
                chunkSize = 0;
                chunkIndex++;
            }
        }
        // return;
        const freezeChunk = [...chunk];
        tasks.push(
            openai
                .createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        ...messages,
                        {
                            role: "user",
                            content: JSON.stringify(freezeChunk),
                        },
                    ],
                })
                .then((completion) => {
                    return matchJSON(`${completion.data.choices[0].message?.content}`);
                })
                .then((raw) => JSON.parse(raw) as string[])
                .then((r) => {
                    if (r.length !== freezeChunk.length) {
                        console.log("diff ", r.length, freezeChunk.length);
                    }
                    return r;
                })
                .catch((err) => {
                    return freezeChunk;
                })
        );
        chunk = [];
        chunkSize = 0;

        // for (let i = 0; i < requireTranslation.length; i += CHUNK_SIZE) {
        //     const chunk = requireTranslation.slice(i, i + CHUNK_SIZE);
        //     const str = JSON.stringify(chunk.map((t) => t[1]))
        //     const strLength = JSON.stringify(chunk.map((t) => t[1])).length
        //     console.log(chunk.length, JSON.stringify(chunk.map((t) => t[1])).length)
        //     messages.push({
        //         role: "user",
        //         content: JSON.stringify(chunk.map((t) => t[1])),
        //     });
        //     tasks.push((async () => {
        //         return JSON.stringify(chunk.map((t) => t[1] + 'tranlated'))
        //     })())
        //     tasks.push(
        //         openai.createChatCompletion({
        //             model: "gpt-3.5-turbo",
        //             messages,
        //         }).then(r => {
        //             console.log('chunk done ' + i)
        //             return r
        //         })
        //     );
        // }
        // console.log(tasks)

        // response.status(200).json({
        //     success: true,
        // });
        // return;
        const translated = (await Promise.all(tasks)).flatMap((t) => t);
        // messages.push({
        //     role: "user",
        //     content: JSON.stringify(requireTranslation.map((t) => t[1])),
        // });
        // const completion = await openai.createChatCompletion({
        //     model: "gpt-3.5-turbo",
        //     messages,
        // });
        // const translatedRaw = matchJSON(`${completion.data.choices[0].message?.content}`);
        // const translatedRaw = matchJSON(`${JSON.stringify(requireTranslation)}`);

        // const translated = JSON.parse(translatedRaw) as string[];

        // console.log(translated, requireTranslation);

        // console.log(translated.length, requireTranslation.length);

        const nextPairs = (translated.map((t, i) => [requireTranslation[i][0], t]) as [string, string][]).concat(noTranslation);
        const result = buildJsonByPairs(nextPairs);
        response.status(200).json({
            success: true,
            data: JSON.stringify(result),
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({
            success: false,
            message: "[/translate] Translating services failed",
            info: `${error}`,
        });
    }
}
