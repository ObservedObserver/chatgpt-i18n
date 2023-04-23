import { BlobWriter, ZipWriter, TextReader } from "@zip.js/zip.js";
import { FileType } from "./types";
import yaml from "js-yaml";

export async function translate(content: string, targetLang: string, fileType: FileType, extraPrompt?: string) {
    const res = await fetch("/api/fastTranslate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content,
            targetLang: targetLang,
            extraPrompt
        }),
    })
    const data = await res.json();
    if (data.success) {
        if (fileType === "yaml") {
            return yaml.dump(JSON.parse(data.data))
        }
        return data.data
    } else {
        throw new Error(data.message)
    }
}

export async function exportLocalFiles(content: string, langList: string[], fileType: FileType) {
    const res = await fetch("/api/exportLocalFiles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content,
            langList
        }),
    })
    const data = await res.json();
    if (data.success) {
        if (fileType === "yaml") {
            for (let i = 0; i < data.data.length; i++) {
                data.data[i].content = yaml.dump(JSON.parse(data.data[i].content))
            }
        }
        return data.data
    } else {
        throw new Error(data.message)
    }
}

export async function makeLocalesInZip (data: { lang: string, content: string }[], fileType: FileType): Promise<File> {
    const zipFileWriter = new BlobWriter();
    const zipWriter = new ZipWriter(zipFileWriter);
    for (let item of data) {
        const content = new TextReader(item.content);
        await zipWriter.add(`${item.lang}.${fileType}`, content);
    }
    const blob = await zipWriter.close();
    return new File([blob], `locales.${fileType}`);
}

export function downloadFileFromBlob(content: Blob, fileName: string) {
    const ele = document.createElement('a');
    ele.setAttribute('href', URL.createObjectURL(content));
    ele.setAttribute('download', fileName);
    ele.style.display = 'none';
    document.body.appendChild(ele);
    ele.click();

    document.body.removeChild(ele);
}