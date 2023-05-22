import { buildJsonByPairs } from "../../api/utils/utils";
import { IMessage, IUserSetting } from "../interface";
import { compressValuesInJson, createChatCompletion, groupPairs, matchJSON } from "../utils";

interface IReqBody {
    content: string;
    targetLang: string;
    extraPrompt?: string;
    config: IUserSetting;
}

export async function translateService(req: IReqBody) {
    const { config, content, targetLang, extraPrompt } = req;
    const messages: IMessage[] = [
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
    const pairs: [string, any][] = [];
    const locale = JSON.parse(content);
    compressValuesInJson(locale, "", pairs);
    const { requireTranslation, noTranslation } = groupPairs(pairs);
    console.log({
        pairs,
        requireTranslation,
        noTranslation
    })
    const tasks: string[][] = [];
    const CHUNK_SIZE = 1000;
    let chunk: string[] = [];
    let chunkSize = 0;
    let chunkIndex = 0;
    for (let i = 0; i < requireTranslation.length; i++) {
        chunk.push(requireTranslation[i][1]);
        chunkSize += requireTranslation[i][1].length;
        if (chunkSize >= CHUNK_SIZE) {
            const freezeChunk = [...chunk];
            const finishedTask = await createChatCompletion(
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        ...messages,
                        {
                            role: "user",
                            content: JSON.stringify(freezeChunk),
                        },
                    ],
                },
                config
            )
                .then((completion) => {
                    return matchJSON(`${completion.choices[0].message?.content}`);
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
            chunk = [];
            chunkSize = 0;
            chunkIndex++;
            tasks.push(finishedTask);
        }
    }
    const freezeChunk = [...chunk];
    const ft = await createChatCompletion(
        {
            model: "gpt-3.5-turbo",
            messages: [
                ...messages,
                {
                    role: "user",
                    content: JSON.stringify(freezeChunk),
                },
            ]
        },
        config
    )
        .then((completion) => {
            return matchJSON(`${completion.choices[0].message?.content}`);
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
    tasks.push(ft);
    chunk = [];
    chunkSize = 0;
    const translated = (await Promise.all(tasks)).flatMap((t) => t);
    const nextPairs = (translated.map((t, i) => [requireTranslation[i][0], t]) as [string, string][]).concat(noTranslation);
    const result = buildJsonByPairs(nextPairs);
    console.log(result)
    return result;
}
