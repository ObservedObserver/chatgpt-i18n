// this is an non-accurate way to estimate token numbers;
// content is a json string
// estimate the word count in content and return the word count
export function estimateTokenCount(content: any): number {
    console.log(content)
    if (typeof content === 'string') {
        return content.split(' ').length;
    }
    if (content instanceof Array) {
        let count = 0;
        for (let item of content) {
            count += estimateTokenCount(item);
        }
        return count;
    }
    if (typeof content === 'object') {
        let count = 0;
        for (let key in content) {
            count += estimateTokenCount(content[key]);
        }
        return count;
    }
    return 1
}