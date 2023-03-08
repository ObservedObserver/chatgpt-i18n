export function compressJson(content: string): string {
    try {
        return JSON.stringify(JSON.parse(content))
    } catch (error) {
        throw new Error('json is not valid')
    }
}

export function prettierJson(content: string): string {
    try {
        return JSON.stringify(JSON.parse(content), null, 2)
    } catch (error) {
        throw new Error('json is not valid')
    }
}