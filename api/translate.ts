import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Configuration, OpenAIApi } from 'openai'
export default async function handler(request: VercelRequest, response: VercelResponse) {
    const params = request.body;
    const { content, targetLang } = params;
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `Translate a i18n locale json content to ${targetLang}. It's a key-value structure, don't translate the key. Consider the context of the value to make better translation.`,
            },
            {
                role: "user",
                content: content
            }
        ],
    });

    response.status(200).json({
        success: true,
        data: completion.data.choices[0].message?.content
    });
}
