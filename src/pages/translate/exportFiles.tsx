import React, { useState } from "react";
import Modal from "../../components/modal";
import { intlLanguages } from "./config";
import { downloadFileFromBlob, exportLocalFiles, makeLocalesInZip } from "./services";
import Spinner from "../../components/spinner";
import { useNotification } from "../../notify";
import { compressJson } from "./utils";

interface ExportFilesProps {
    originalContent: string;
}
const ExportFiles: React.FC<ExportFilesProps> = (props) => {
    const { originalContent } = props;
    const [show, setShow] = useState<boolean>(false);
    const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { notify } = useNotification();

    const handleLangChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedLangs([...selectedLangs, value]);
        } else {
            setSelectedLangs(selectedLangs.filter((lang) => lang !== value));
        }
    };

    async function downloadFiles () {
        setLoading(true);
        try {
            const compressedContent = compressJson(originalContent);
            const res = await exportLocalFiles(compressedContent, selectedLangs)
            const file = await makeLocalesInZip(res)
            downloadFileFromBlob(file, "locales.zip")
        } catch (error) {
            notify({
                title: "export files error",
                message: `${error}`,
                type: "error",
            }, 3000)
        } finally {
            setLoading(false);
            setShow(false);
        }
    }

    return (
        <span>
            <button
                type="button"
                className="ml-2 px-6 rounded bg-indigo-600 shadow-indigo-500/50 py-1.5 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={() => {
                    setShow(true);
                }}
            >
                Translate to files
            </button>
            <Modal
                open={show}
                onClose={() => {
                    setShow(false);
                }}
                onConfirm={downloadFiles}
            >
                <fieldset>
                    <legend className="text-base font-semibold leading-6 text-gray-50">Languages</legend>
                    <div className="mt-4 divide-y divide-gray-600 border-t border-b border-gray-600">
                        {intlLanguages.map((lang, personIdx) => (
                            <div key={personIdx} className="relative flex items-start py-2">
                                <div className="min-w-0 flex-1 text-sm leading-6">
                                    <label htmlFor={`person-${lang.value}`} className="select-none font-medium text-gray-50">
                                        {lang.label} | {lang.value}
                                    </label>
                                </div>
                                <div className="ml-3 flex h-6 items-center">
                                    <input
                                        checked={selectedLangs.includes(lang.value)}
                                        id={`person-${lang.value}`}
                                        name={`person-${lang.value}`}
                                        value={lang.value}
                                        type="checkbox"
                                        className="h-4 w-4 rounded bg-gray-900 border-gray-500 text-indigo-600 focus:ring-indigo-600"
                                        onChange={handleLangChange}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </fieldset>
                {
                    loading &&<div className="flex justify-center py-2">
                        <Spinner />
                        <h2 className="text-base font-white">Generate locale files</h2>
                    </div>
                }
            </Modal>
        </span>
    );
};

export default ExportFiles;
