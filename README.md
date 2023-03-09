# chatgpt-i18n

![](https://img.shields.io/github/actions/workflow/status/ObservedObserver/chatgpt-i18n/auto-build.yml)

Translate your locale files with AI assisant.

Welcome to the ChatGPT + i18n app. This app is designed to help you translate your locale files with ease. Whether you are translating an application, website, or any other project that requires localization, it will make the process faster and more efficient.

I build this app because I was tired of using Google Translate to translate my locale files. I wanted to use a more efficient and accurate translation tool. ChatGPT, however, always break my json and cannot translate large contents. So I build this app to solve these problems. Hope you enjoy it.

## Demo

![chatgpt-i18n demo](https://user-images.githubusercontent.com/22167673/223788460-057b420f-c1c2-426c-b285-6284257c846b.png)

## Features
- [x] Traslate your locale files with better experience.
- [x] A web editor for better editing and viewing experience.
- [ ] Export multiple locale files at once. (WIP)
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
