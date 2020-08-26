export function uniqueArr(data: string[]): string[] {
    return [...new Set([...data])]
}
