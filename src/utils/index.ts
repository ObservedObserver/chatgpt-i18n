import { IMessage, IUserSetting } from "../interface";

export function compressValuesInJson (conentJson: any, path: string, pairs: [string, any][]) {
    if (typeof conentJson === 'object') {
        Object.keys(conentJson).forEach(k => {
            let p = path
            if (p.length !== 0) {
                p += '.'
            }
            p += k;
            if (typeof conentJson[k] !== 'object') {
                pairs.push([p, conentJson[k]])
            } else {
                compressValuesInJson(conentJson[k], p, pairs)
            }
        })
    } else {
        pairs.push([path, conentJson])
    }
}

/**
 * group pairs into two category, pairs need to be translated or not
 * @param pairs 
 */
export function groupPairs (pairs: [string, any][]): {
    requireTranslation: [string, string][],
    noTranslation: [string, any][]
} {
    const requireTranslation: [string, string][] = [];
    const noTranslation: [string, string][] = [];
    for (let pair of pairs) {
        if (typeof pair[1] === 'string') {
            requireTranslation.push(pair)
        } else {
            noTranslation.push(pair)
        }
    }
    return {
        requireTranslation,
        noTranslation
    }
}

export interface ICreateChatCompletionProps {
    model: string;
    messages: IMessage[];

}
export interface ICreateChatCompletionResponse {
    id: string;
    object: string;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: { message: { role: string; content: string } }[];
}
export async function createChatCompletion(props: ICreateChatCompletionProps, config: IUserSetting): Promise<ICreateChatCompletionResponse> {
    let url: string = '';
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    }
    if (config.serviceProvider === 'openai') {
        // openai chat completion
        url = 'https://api.openai.com/v1/chat/completions'
        headers['Authorization'] = `Bearer ${config.apiKey}`
    } else if (config.serviceProvider === 'azure') {
        headers['api-key'] = `${config.apiKey}`
        url = `${config.baseURL}/openai/deployments/${config.deployName}/chat/completions?api-version=2023-03-15-preview`
    }
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: props.model,
            messages: props.messages,
            temperature: 0,
        })
    })
    if (response.status !== 200) {
        throw new Error('failed to create chat completion')
    }
    return await response.json() as ICreateChatCompletionResponse
}

export function matchJSON(str: string) {
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