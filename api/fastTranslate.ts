import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { buildJsonByPairs, compressValuesInJson, groupPairs, splitArray, translateChunk } from "./utils/utils.js";
import pRetry from "p-retry";

// Define the expected shape of the request body
interface IReqBody {
    content: string;
    targetLang: string;
    extraPrompt?: string;
    gptModel?: string;
}

// Define the main handler function for the API call
export default async function handler(request: VercelRequest, response: VercelResponse) {
    // Extract the relevant fields from the request body
    const params = request.body as IReqBody;
    const { content, targetLang, extraPrompt, gptModel } = params;

    const maxCharsPerChunk = 2000;

    try {
        // Initialize the OpenAI API connection with the provided API key
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        // Parse the input JSON object into an in-memory representation
        const locale = JSON.parse(content);

        // Compress the parsed JSON object into an array of key-value pairs
        const pairs: [string, any][] = [];
        compressValuesInJson(locale, "", pairs);

        // Group the pairs into two arrays - one that requires translation to the target language and one that does not
        const chosenModel = gptModel || "gpt-3.5-turbo";
        const { requireTranslation, noTranslation } = groupPairs(pairs);

        // Translate the chunks of text that need to be translated using the OpenAI API
        const chunks = splitArray(
            requireTranslation.map((r) => r[1]), // Extract the values of the pairs that require translation
            maxCharsPerChunk // Groups of 2000 characters or less
        );

        // Use pRetry to retry the translation if it fails
        // Use Promise.all to translate all chunks in parallel and preserve the order of the chunks
        const translatedChunks: string[][] = await Promise.all(
            chunks.map((chunk) =>
                pRetry(() => translateChunk(chunk, openai, chosenModel, targetLang, extraPrompt), {
                    retries: 3,
                    onFailedAttempt: async (error) => {
                        console.error(error)
                    },
                })
            )
        );

        // Flatten the array of translated chunks into a single array of translated texts
        const translated = translatedChunks.flat();

        // Combine the original untranslatable pairs with the translated pairs into a single array
        const nextPairs = (translated.map((t, i) => [requireTranslation[i][0], t]) as [string, string][]).concat(noTranslation);

        // Convert the pair array back into a JSON object
        const result = buildJsonByPairs(nextPairs);

        // Send the resulting JSON object as a response to the client
        response.status(200).json({
            success: true,
            data: JSON.stringify(result),
        });
    } catch (error) {
        // Handle any errors that occur during processing and return an appropriate error message
        console.error(error);
        response.status(500).json({
            success: false,
            message: "[/fastTranslate] Translating services failed",
            info: `${error}`,
        });
    }
}
