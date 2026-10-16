import { makeAutoObservable, toJS } from "mobx";
import { IUserSetting } from "../interface";
import { DEFAULT_MODEL } from "../../lib/ai-config";

export class CommonStore {
    config: IUserSetting = {
        apiKey: "",
        baseURL: "https://xxx.openai.azure.com",
        deployName: "xxx",
        serviceProvider: "openrouter",
        model: DEFAULT_MODEL,
    };
    constructor() {
        makeAutoObservable(this);
    }
    public updateConfig(configKey: keyof IUserSetting, value: any) {
        this.config[configKey] = value;
    }
    public saveConfig() {
        const configJson = JSON.stringify(toJS(this.config));
        localStorage.setItem("config", configJson);
    }
    public loadConfig() {
        const configJSON = localStorage.getItem("config");
        if (configJSON && configJSON.length > 0) {
            try {
                const saved = JSON.parse(configJSON);
                this.config = { ...this.config, ...saved };
                if (saved.serviceProvider === "openai") {
                    this.config.serviceProvider = "openrouter";
                    this.config.apiKey = "";
                    this.config.model = DEFAULT_MODEL;
                    this.saveConfig();
                } else if (saved.serviceProvider === "openrouter" &&
                    (!saved.model || ["gpt-3.5-turbo", "gpt-3.5-turbo-0301", "openai/gpt-3.5-turbo"].includes(saved.model))) {
                    this.config.model = DEFAULT_MODEL;
                    this.saveConfig();
                }
            } catch (error) {}
        } else {
            console.log('Not found default settings')
        }
    }
}
