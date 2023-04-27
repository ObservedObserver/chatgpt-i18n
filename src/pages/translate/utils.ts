import xml from "fast-xml-parser";
import yaml from "js-yaml";

export type FileType = "json" | "yaml" | "xml";

const xmlOptions = {
    ignoreAttributes: false,
    allowBooleanAttributes: true,
    attributeNamePrefix: "@_",
    preserverOrder: true,
};

export const xmlParser = new xml.XMLParser(xmlOptions);
export const xmlBuilder = new xml.XMLBuilder({ ...xmlOptions, format: true });

export function compress(content: string, fileType: FileType): string {
    try {
        if (fileType === "xml") {
            return JSON.stringify(xmlParser.parse(content));
        }
        if (fileType === "yaml") {
            return JSON.stringify(yaml.load(content));
        }
        return JSON.stringify(JSON.parse(content));
    } catch (error) {
        throw new Error(`${fileType} is not valid`);
    }
}

export function prettify(content: string, fileType: FileType): string {
    try {
        if (fileType === "xml") {
            return xmlBuilder.build(xmlParser.parse(content));
        }
        if (fileType === "yaml") {
            yaml.dump(yaml.load(content));
        }
        return JSON.stringify(JSON.parse(content), null, 2);
    } catch (error) {
        throw new Error(`${fileType} is not valid`);
    }
}

// copy content to clipboard
export function copy2clipboard(content: string) {
    navigator.clipboard.writeText(content);
}
