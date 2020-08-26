export function filterOut(value: string[], from: string[]): string[] {
    try {
        let filtered = from;
        value.map(v => filtered = filtered.filter(fv => fv !== v))
        return filtered
    } catch (err) {
        throw err
    }
}

export function filterIn(value: string[], from: string[]): string[] {
    try {
        let filtered = from;
        value.map(v => filtered = filtered.filter(fv => fv === v))
        return filtered
    } catch (err) {
        throw err
    }
}
