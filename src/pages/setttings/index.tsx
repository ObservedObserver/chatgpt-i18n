import React from "react";
import { DEFAULT_MODEL } from "../../../lib/ai-config";
import Header from "../../components/header";
import TextField from "../../components/textField";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "../../store";
import DropdownSelect from "../../components/dropdownSelect";
import { useNotification } from "../../notify";

const Settings: React.FC = (props) => {
    // const {  } = props;
    const { commonStore } = useGlobalStore();
    const { notify } = useNotification();
    const { config } = commonStore;

    return (
        <div>
            <Header />
            <div className="text-white container mx-auto p-4">
                <p className="my-2 text-gray-200">You config will only be used by yourself and stored in your localstorage.</p>
                <DropdownSelect
                    options={[
                        {
                            value: "azure",
                            label: "azure",
                        },
                        {
                            value: "openrouter",
                            label: "OpenRouter",
                        },
                    ]}
                    selectedKey={config.serviceProvider}
                    onSelect={(v) => {
                        if (v !== config.serviceProvider) {
                            commonStore.updateConfig("apiKey", "");
                            commonStore.updateConfig("model", v === "openrouter" ? DEFAULT_MODEL : "gpt-3.5-turbo");
                        }
                        commonStore.updateConfig("serviceProvider", v);
                    }}
                />
                <TextField
                    value={`${config.apiKey}`}
                    label={config.serviceProvider === "openrouter" ? "OpenRouter API Key" : "API Key"}
                    onChange={(v) => {
                        commonStore.updateConfig("apiKey", v);
                    }}
                />
                <TextField
                    value={config.model}
                    label="Model"
                    onChange={(v) => commonStore.updateConfig("model", v)}
                />
                {config.serviceProvider === "azure" && (
                    <TextField
                        value={`${config.baseURL}`}
                        label="Base URL"
                        onChange={(v) => {
                            commonStore.updateConfig("baseURL", v);
                        }}
                    />
                )}
                {config.serviceProvider === "azure" && (
                    <TextField
                        value={`${config.deployName}`}
                        label="Deploy Name"
                        onChange={(v) => {
                            commonStore.updateConfig("deployName", v);
                        }}
                    />
                )}

                <div className="mt-2">
                    <button
                        type="button"
                        className="mr-2 px-6 inline-flex rounded bg-indigo-500 shadow-indigo-500/50 py-1.5 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={() => {
                            commonStore.saveConfig();
                            notify(
                                {
                                    title: "Saved",
                                    type: "success",
                                    message: "Config is saved in localstorage.",
                                },
                                1000
                            );
                        }}
                    >
                        Save Config
                    </button>
                </div>
            </div>
        </div>
    );
};

export default observer(Settings);
