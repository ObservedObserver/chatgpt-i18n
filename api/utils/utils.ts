// this is an non-accurate way to estimate token numbers;
// content is a json string

import { ChatCompletionRequestMessage, OpenAIApi } from "openai/dist/api";

/**
 * Estimates the token count in `content` using a regular expression.
 * @param content - A string, array, or object (or nested combination thereof) for which to estimate token count.
 * @returns The estimated token count.
 */
export function estimateTokenCount(content: any): number {

    if (typeof content === 'string') { // If the input is a string, split it by whitespace and special characters, and multiply the length by 2 to account for non-ASCII characters
        return content.split(/[\s.'_A-Z0-9]/).length * 2;
    }

    if (content instanceof Array) { // If the input is an array, recursively call this function on each element and sum the results
        let count = 0;
        for (let item of content) {
            count += estimateTokenCount(item);
        }
        return count;
    }

    if (typeof content === 'object') { // If the input is an object, recursively call this function on each value and key, and sum the results plus the length of each key multiplied by 2 to account for non-ASCII characters
        let count = 0;
        for (let key in content) {
            count += estimateTokenCount(content[key]);
            count += key.split(/[_A-Z0-9]/).length * 2;
        }
        return count;
    }

    return 1; // Return 1 if the input is invalid or empty
}


export function compressValuesInJson(conentJson: any, path: string, pairs: [string, any][]) {
    if (typeof conentJson === "object") {
        Object.keys(conentJson).forEach((k) => {
            let p = path;
            if (p.length !== 0) {
                p += ".";
            }
            p += k;
            if (typeof conentJson[k] !== "object") {
                pairs.push([p, conentJson[k]]);
            } else {
                compressValuesInJson(conentJson[k], p, pairs);
            }
        });
    } else {
        pairs.push([path, conentJson]);
    }
}



/**
 * group pairs into two category, pairs need to be translated or not
 * @param pairs 
 */
export function groupPairs(pairs: [string, any][]): {
    requireTranslation: [string, string][];
    noTranslation: [string, any][];
} {
    const requireTranslation: [string, string][] = [];
    const noTranslation: [string, string][] = [];
    for (let pair of pairs) {
        if (typeof pair[1] === "string") {
            requireTranslation.push(pair);
        } else {
            noTranslation.push(pair);
        }
    }
    return {
        requireTranslation,
        noTranslation,
    };
}

export function buildJsonByPairs(pairs: [string, any][]) {
    let ans: any = {};
    for (let pair of pairs) {
        const path = pair[0];
        const keys = path.split(".");
        let kIndex = 0;
        let node = ans;
        while (kIndex < keys.length - 1) {
            if (typeof node[keys[kIndex]] === "undefined") {
                node[keys[kIndex]] = {} as any;
            }
            node = node[keys[kIndex]];
            kIndex++;
        }
        node[keys[kIndex]] = pair[1];
    }
    return ans;
}

/**
 * Parses an array from a string containing an array and returns the contents of the array as an array of strings,
 * where each element is either a nested array in string format or an element enclosed in double quotes.
 *
 * @param str The string to parse the array from. Example: "Translated output is: ['hello', 'world', '['nested', 'array']']"
 * @returns An array of strings representing the contents of the input array. If the input string is invalid, throws an Error.
 * Example: ["hello", "world", "['nested', 'array']"]
 */
export function parseArrayFromOpenAIResponse(str: string): string[] {
    const arrayStartIndex = str.indexOf('[');
    const arrayEndIndex = str.lastIndexOf(']');
  
    if (arrayStartIndex === -1 || arrayEndIndex === -1 || arrayStartIndex > arrayEndIndex) {
      throw new Error("Invalid array format");
    }

    const arrayString = str.substring(arrayStartIndex, arrayEndIndex + 1);
    const array = JSON.parse(arrayString) as string[];
    return array
}

/**
 * Splits an array of strings into chunks of arrays of string. Each chunk will contain up to maxSize total characters.
 * @param stringArray - The input array of strings that will be split into chunks.
 * @param maxSize - The maximum size (in characters) of each chunk.
 * @returns An array of arrays (of strings), where each inner array is a chunk containing up to maxSize total characters.
 */
export function splitArray(stringArray: string[], maxSize: number): string[][] {
    const result = [];
    let chunk: string[] = [];
    let chunkSize = 0;

    // Loop through the input string array to split it into smaller arrays of maxSize or less length
    for (let i = 0; i < stringArray.length; i++) {
        const value = stringArray[i];

        // Calculate the size of the current entry; this uses the character count for now but may need improvement for non-English languages
        const entrySize = value.length;

        // Check if adding the current entry to the current chunk would exceed the maxSize
        if (chunkSize + entrySize > maxSize) {
            result.push(chunk);
            chunk = [];
            chunkSize = 0;
        }

        chunk.push(value);
        chunkSize += entrySize;
    }

    if (chunkSize > 0) {
        result.push(chunk);
    }

    return result;
}

/**
 * Translates an array of strings using OpenAI's API.
 * @param requireTranslation - An array of strings to be translated.
 * @param openai - An instance of the OpenAI API client.
 * @param model - The name of the OpenAI translation model to be used.
 * @param targetLang - A string representing the target language into which the input strings should be translated.
 * @param extraPrompt - An optional string containing additional instructions or prompts for the translator.
 * @returns A promise that resolves to an array of strings, which are the translated versions of the input strings.
 */
export async function translateChunk(
    requireTranslation: string[],
    openai: OpenAIApi,
    model: string,
    targetLang: string,
    extraPrompt?: string
) {
    // use 3.5 turbo by default
    const modelToUse = model || "gpt-3.5-turbo"
    // Prepare the chat messages to send to the OpenAI API
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
            Translate this array:`,
        });
    }
    messages.push({
        role: "user",
        content: JSON.stringify(requireTranslation),
    });

    console.log("Translating chunk: ", requireTranslation)

    // Request chat completion from OpenAI API using the given model and messages
    const completion = await openai.createChatCompletion({
        model: modelToUse,
        messages,
    });

    // Get the response from the API, match the JSON objects within it, and parse back into an array of strings
    const translated = parseArrayFromOpenAIResponse(`${completion.data.choices[0].message?.content}`);
    console.log("Translated chunk: ", translated)

    // Check that the number of translated strings matches the number of input strings
    if (translated.length !== requireTranslation.length) {
        throw new Error(
            `The number of translated strings (${translated.length}) does not match the number of input strings (${requireTranslation.length}).`
        );
    }

    return translated;
}
