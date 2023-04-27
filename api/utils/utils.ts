export type FileType = "json" | "yaml" | "xml";

// this is an non-accurate way to estimate token numbers;
// content is a json string
// estimate the word count in content and return the word count
export function estimateTokenCount(content: any): number {
    console.log(content);
    if (typeof content === "string") {
        return content.split(" ").length;
    }
    if (content instanceof Array) {
        let count = 0;
        for (let item of content) {
            count += estimateTokenCount(item);
        }
        return count;
    }
    if (typeof content === "object") {
        let count = 0;
        for (let key in content) {
            count += estimateTokenCount(content[key]);
        }
        return count;
    }
    return 1;
}

export function compressValuesInJson(conentJson: any, path: string, pairs: [string, any][]) {
    if (typeof conentJson === "object") {
        Object.keys(conentJson).forEach((k) => {
            let p = path;
            if (p.length !== 0) {
                p += ".";
            }
            p += k;
            if (typeof conentJson[k] !== "object") {
                pairs.push([p, conentJson[k]]);
            } else {
                compressValuesInJson(conentJson[k], p, pairs);
            }
        });
    } else {
        pairs.push([path, conentJson]);
    }
}

/**
 * group pairs into two category, pairs need to be translated or not
 * @param pairs
 */
export function groupPairs(
    pairs: [string, any][],
    fileType: FileType
): {
    requireTranslation: [[string, string], number][];
    noTranslation: [[string, any], number][];
} {
    const requireTranslation: [[string, string], number][] = [];
    const noTranslation: [[string, any], number][] = [];
    for (const [i, pair] of pairs.entries()) {
        // if it is an XML, don't translate the attributes
        if (typeof pair[1] === "string" && !(fileType === "xml" && pair[0].split(".").pop()?.startsWith("@_"))) {
            requireTranslation.push([pair, i]);
        } else {
            noTranslation.push([pair, i]);
        }
    }
    return {
        requireTranslation,
        noTranslation,
    };
}

/**
 * merge two pairs and sort them based on the index
 * @param requireTranslation
 * @param noTranslation
 * @returns sortedPairs
 */
export function mergeAndSortPairs(
    requireTranslation: [[string, string], number][],
    noTranslation: [[string, any], number][]
): [string, any][] {
    const combined = [...requireTranslation, ...noTranslation];

    // Remove the index and sort based on it
    const sortedPairs = combined.sort((a, b) => a[1] - b[1]).map((pair) => pair[0]);

    return sortedPairs;
}

export function buildJsonByPairs(pairs: [string, any][]) {
    let ans: any = {};
    for (let pair of pairs) {
        const path = pair[0];
        const keys = path.split(".");
        let kIndex = 0;
        let node = ans;
        while (kIndex < keys.length - 1) {
            if (typeof node[keys[kIndex]] === "undefined") {
                node[keys[kIndex]] = {} as any;
            }
            node = node[keys[kIndex]];
            kIndex++;
        }
        node[keys[kIndex]] = pair[1];
    }
    return ans;
}
