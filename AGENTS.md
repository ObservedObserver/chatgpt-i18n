# Project guidance

- OpenAI models are accessed through OpenRouter at `https://openrouter.ai/api/v1`; default model: `openai/gpt-5.4-mini`.
- Backend APIs use `OPENROUTER_API_KEY` and optional `OPENROUTER_MODEL`. Browser translations use Settings stored in localStorage. Keep both paths aligned; never forward legacy OpenAI keys to OpenRouter.
- Preserve Azure support and unrelated user changes. Use Node.js 22 and OpenAI SDK 7. Run `yarn test` for migration regressions and `yarn build` to check TypeScript and the frontend build.
- Keep this file concise and update existing guidance when project decisions change. Do not make unrelated edits.
- If a command is unavailable, try `source ~/.zshrc`.
