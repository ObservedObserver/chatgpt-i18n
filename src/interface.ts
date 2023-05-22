export interface IUserSetting {
    apiKey: string | null;
    baseURL: string | null;
    // DEPLOYMENT_NAME
    // development_name: boolean;
    deployName: string | null;
    serviceProvider: string;
    model: string;
}

export interface IMessage {
    role: string;
    content: string;
}