# chatgpt-i18n

![](https://img.shields.io/github/actions/workflow/status/ObservedObserver/chatgpt-i18n/auto-build.yml)
![](https://img.shields.io/github/license/observedobserver/chatgpt-i18n?color=black)

Translate your locale files with AI Assistance.

Welcome to the ChatGPT + i18n app. This app is designed to help you translate your locale files with ease. Whether you are translating an application, website, or any other project that requires localization, it will make the process faster and more efficient.

I build this app because I was tired of using Google Translate to translate my locale files. I wanted to use a more efficient and accurate translation tool. ChatGPT, however, always break my json and cannot translate large contents. So I build this app to solve these problems. Hope you enjoy it.

## Demo

[Demo on Vercel](https://www.i18n.ing/)
translate

![chatgpt-i18n demo](https://user-images.githubusercontent.com/22167673/224185217-a32406fd-740c-4ced-b86c-55b2b895dc12.png)


download multi locale files

![export-locale-files](https://user-images.githubusercontent.com/22167673/224073592-77bffd43-7422-40d2-984d-cfe95079ceb0.png)




## Features
- [x] Traslate your locale files with better experience.
- [x] A web editor for better editing and viewing experience.
- [x] Export multiple locale files at once.
- [x] Seperate large json file into small chunks to avoid ChatGPT breaking json. (WIP: the service seems slow now, and sometimes break the limit of vercel FaaS, I am working on it.) 

## Deploy

Requires Node.js 22. The backend uses OpenAI SDK 7 with OpenRouter.

Step 1. Create .env with your OpenRouter key for the backend APIs
```bash
OPENROUTER_API_KEY=<your OpenRouter key>
OPENROUTER_MODEL=openai/gpt-5.4-mini
```

Browser translations use the key saved in Settings, independently of the backend environment.
Select OpenRouter, enter your OpenRouter API key, and save. The default model is
`openai/gpt-5.4-mini`; you can enter another OpenRouter OpenAI model ID in Model.
Existing OpenAI settings are migrated to OpenRouter with the old key cleared.
The default model runs with reasoning disabled for translation. Saved GPT-3.5 OpenRouter settings upgrade automatically; custom model IDs are preserved.
Azure settings remain supported. Switching providers clears the key.

Integration follows the [OpenRouter quickstart](https://openrouter.ai/docs/quickstart).

Step 2. Install dependencies
```bash
yarn install --frozen-lockfile
```


Step 3. Build App

```bash
# forntend
npm run build
# backend
npm run server:build
```

## Development

```bash
npm run server
# vercel dev (this contains both frontend and backend)
# localhost:3000
```

## Validation

```bash
yarn test
yarn build
```

Tests mock OpenRouter responses and do not make paid model calls.
