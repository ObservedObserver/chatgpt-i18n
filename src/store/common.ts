import { makeAutoObservable, toJS } from "mobx";
import { IUserSetting } from "../interface";

export class CommonStore {
    config: IUserSetting = {
        apiKey: "your-key",
        baseURL: "https://xxx.openai.azure.com",
        deployName: "xxx",
        serviceProvider: "azure",
        model: "gpt-3.5-turbo-0301",
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
                this.config = JSON.parse(configJSON);
            } catch (error) {}
        } else {
            console.log('Not found default settings')
        }
    }
}
