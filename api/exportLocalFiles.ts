import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createTranslationClient, translationModel } from "../lib/openrouter.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const params = request.body;
    const { content, langList = [] } = params;
    if (langList.length === 0) {
        response.status(200).json({
            success: false,
            message: "langList is empty",
        });
        return;
    }
    try {
        const openai = createTranslationClient();
        const result: { lang: string; content: string }[] = [];
        for (let lang of langList) {
            const completion = await openai.chat.completions.create({
                ...translationModel(),
                messages: [
                    {
                        role: "system",
                        content: `Translate a i18n locale json content to ${lang}. It's a key-value structure, don't translate the key. Consider the context of the value to make better translation.`,
                    },
                    {
                        role: "user",
                        content: content,
                    },
                ],
                max_tokens: 1000,
            });
            result.push({
                lang,
                content: `${completion.choices[0].message?.content}`,
            });
        }

        response.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            message: '[/exportLocalFiles] Translating services failed',
            info: error
        });
    }
}
