import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Configuration, OpenAIApi } from 'openai'
import { estimateTokenCount } from "./utils/utils";

async function getSubJson (node: any, action: (n: any) => Promise<any>): Promise<any> {
    if (estimateTokenCount(node) < 4096) {
        if (typeof node !== 'string' && typeof node !== 'object') {
            return node;
        }
        // console.log(estimateTokenCount(node))
        return action(node);
    }
    if (node instanceof Array) {
        let nextArray: any[] = [];
        for (let item of node) {
            const nextItem = await getSubJson(item, action);
            nextArray.push(nextItem);
        }
        return nextArray;
    }
    if (typeof node === 'object') {
        let nextObject: any = {};
        let pool: any = {}
        let poolSize: number = 0;
        for (let key in node) {
            let nodeSize = estimateTokenCount(node[key]);
            if (nodeSize + poolSize < 4096 * 0.8) {
                poolSize += nodeSize;
                pool[key] = node[key];
                continue;
            } else {
                const nextItem = await getSubJson(pool, action);
                nextObject = {...nextObject, ...nextItem};
                pool = {[key]: node[key]};
                poolSize = nodeSize;
            }
            // const nextItem = await getSubJson(node[key], action);
            // nextObject[key] = nextItem;
        }
        return nextObject;
    }
    return node
}

function matchJSON (str: string) {
    let start = 0;
    let end = 0;
    let stack: string[] = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '{') {
            if (stack.length === 0) {
                start = i;
            }
            stack.push('{');
        }
        if (str[i] === '}') {
            stack.pop();
            if (stack.length === 0) {
                end = i;
                break;
            }
        }
    }
    return str.slice(start, end + 1);
}
export default async function handler(request: VercelRequest, response: VercelResponse) {
    const params = request.body;
    const { content, targetLang } = params;
    try {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const copiedContent = JSON.parse(content);
        if (estimateTokenCount(copiedContent) < 4096) {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Translate a i18n locale json content to ${targetLang}. It's a key-value structure, don't translate the key. Consider the context of the value to make better translation.`,
                    },
                    {
                        role: "user",
                        content
                    }
                ],
                max_tokens: 4000
            });
            const ans = matchJSON(`${completion.data.choices[0].message?.content}`);
            response.status(200).json({
                success: true,
                data: ans
            });
            return;
        }
        
        const result = await getSubJson(copiedContent, async (node) => {
            let str: string = '';
            if (typeof node !== 'string') {
                str = JSON.stringify(node);
            } else {
                str = `${node}`
            }
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Translate a i18n locale json content to ${targetLang}. It's a key-value structure, don't translate the key. Consider the context of the value to make better translation.`,
                    },
                    {
                        role: "user",
                        content: str
                    }
                ],
            });
            let res: any = `${completion.data.choices[0].message?.content}`;
            if (typeof node === 'string') {
                return res;
            }
            try {
                res = JSON.parse(res)
            } catch (error) {
                res = completion.data.choices[0].message?.content
            }
            return res
        })
        response.status(200).json({
            success: true,
            data: JSON.stringify(result)
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            message: '[/translate] Translating services failed',
            info: error
        })
    }
}
