import React, { useCallback, useState } from "react";
import MonacoEditor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import Header from "../../components/header";
import Background from "../../components/background";
import DropdownSelect from "../../components/dropdownSelect";
import { compress, copy2clipboard, prettify } from "./utils";
import ExportFiles from "./exportFiles";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { fileTypes, intlLanguages } from "./config";
import { translate } from "./services";
import Spinner from "../../components/spinner";
import { useNotification } from "../../notify";
import TextField from "../../components/textField";
import { FileType } from "./utils";
import xml from "fast-xml-parser";

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === "json") {
            return new jsonWorker();
        }
        if (label === "css" || label === "scss" || label === "less") {
            return new cssWorker();
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
            return new htmlWorker();
        }
        if (label === "typescript" || label === "javascript") {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

loader.config({ monaco });
loader.init();

const Translate: React.FC = (props) => {
    const [originalContent, setOriginalContent] = useState("");
    const [lang, setLang] = useState<string>(intlLanguages[1].value);
    const [transContent, setTransContent] = useState("");
    const [extraPrompt, setExtraPrompt] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [fileType, setFileType] = useState<FileType>("json");
    const { notify } = useNotification();

    const requestTranslation = useCallback(async () => {
        setLoading(true);
        try {
            const compressedContent = compress(originalContent, fileType);
            const data = await translate(compressedContent, lang, fileType, extraPrompt);
            setTransContent(prettify(data, fileType));
        } catch (error) {
            notify(
                {
                    title: "translate service error",
                    message: `${error}`,
                    type: "error",
                },
                3000
            );
        } finally {
            setLoading(false);
        }
    }, [originalContent, lang, fileType, extraPrompt]);

    return (
        <div className="text-white">
            <Header />
            <Background />
            <div className="container mx-auto mt-4">
                <div className="dark flex items-center">
                    <DropdownSelect
                        className="inline-block w-36"
                        buttonClassName="w-full"
                        options={intlLanguages}
                        selectedKey={lang}
                        onSelect={(val) => setLang(val)}
                    />
                    <DropdownSelect
                        className="inline-block w-28 pl-2"
                        buttonClassName="w-full"
                        options={fileTypes}
                        selectedKey={fileType}
                        onSelect={(val) => setFileType(val as FileType)}
                    />
                    <button
                        type="button"
                        className="ml-2 inline-flex rounded bg-indigo-500 shadow-indigo-500/50 py-1.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={requestTranslation}
                    >
                        {loading && <Spinner />}
                        Translate
                    </button>
                    <ExportFiles originalContent={originalContent} fileType={fileType} />
                </div>
                <div className="mt-2">
                    <TextField
                        label="Customized Prompt (Optional)"
                        placeholder="Add more prompt (like background knowledge) to help the translation if needed."
                        value={extraPrompt}
                        onChange={(val) => {
                            setExtraPrompt(val);
                        }}
                    />
                </div>
                <div className="grid grid-cols-2 mt-6">
                    <div className="shadow-lg border border-gray-700 rounded m-2">
                        <div className="p-2">Original locale</div>
                        <MonacoEditor
                            value={originalContent}
                            onChange={(val) => {
                                setOriginalContent(val ?? "");
                            }}
                            height="600px"
                            language={fileType}
                            theme="vs-dark"
                        />
                    </div>
                    <div className="shadow-lg border border-gray-700 rounded m-2">
                        <div className="p-2">
                            Translated locale
                            <DocumentDuplicateIcon
                                onClick={() => {
                                    copy2clipboard(transContent);
                                    notify(
                                        {
                                            type: "success",
                                            title: "copied!",
                                            message: "copy to clipboard",
                                        },
                                        1000
                                    );
                                }}
                                className="float-right w-5 text-white cursor-pointer hover:scale-110"
                            />
                        </div>
                        <MonacoEditor
                            // onMount={(editor, m) => {
                            //     resultEditorRef.current = editor;
                            // }}
                            value={transContent}
                            height="600px"
                            language={fileType}
                            theme="vs-dark"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Translate;
