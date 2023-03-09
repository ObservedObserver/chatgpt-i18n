import React, { useState } from "react";
import Modal from "../../components/modal";

const ExportFiles: React.FC = (props) => {
    const [show, setShow] = useState<boolean>(false);

    return (
        <span>
            <button
                type="button"
                className="ml-2 px-6 rounded-lg bg-indigo-500 py-1.5 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={() => {
                    setShow(true);
                }}
            >
                translate to files
            </button>
            <Modal
                open={show}
                onClose={() => {
                    setShow(false);
                }}
                onConfirm={() => {
                    setShow(false);
                }}
            >
                WIP
            </Modal>
        </span>
    );
};

export default ExportFiles;
