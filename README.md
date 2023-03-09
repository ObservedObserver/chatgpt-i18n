![banner-chatgpt-i18n](https://user-images.githubusercontent.com/22167673/224081173-474ac863-a01f-49e7-be57-f02afcd92889.png)


# chatgpt-i18n

![](https://img.shields.io/github/actions/workflow/status/ObservedObserver/chatgpt-i18n/auto-build.yml)

Translate your locale files with AI Assistance.

Welcome to the ChatGPT + i18n app. This app is designed to help you translate your locale files with ease. Whether you are translating an application, website, or any other project that requires localization, it will make the process faster and more efficient.

I build this app because I was tired of using Google Translate to translate my locale files. I wanted to use a more efficient and accurate translation tool. ChatGPT, however, always break my json and cannot translate large contents. So I build this app to solve these problems. Hope you enjoy it.

## Demo

[Demo on Vercel](https://chatgpt-i18n.vercel.app/)

translate

![chatgpt-i18n demo](https://user-images.githubusercontent.com/22167673/224073144-558b3cf5-a7e5-4351-a394-5821c90f0ba9.png)

download multi locale files

![export-locale-files](https://user-images.githubusercontent.com/22167673/224073592-77bffd43-7422-40d2-984d-cfe95079ceb0.png)




## Features
- [x] Traslate your locale files with better experience.
- [x] A web editor for better editing and viewing experience.
- [x] Export multiple locale files at once.
- [ ] Seperate large json file into small chunks to avoid ChatGPT breaking json.

## Deploy

Step 1. Create .env file with openai key
```bash
OPENAI_API_KEY=<your key>
```

Step 2. Install dependencies
```bash
npm install
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
