import { isDefined } from "./isDefined"

export function getSubWherePropertyExists(data: any, property: string) {
    return Object.keys(data).map(td => {
        if (data[td].hasOwnProperty(property)) {
            return {
                [td]: data[td]
            }
        } else return
    }).filter(isDefined).reduce((acc, x) => {
        for (const key in x) acc[key] = x[key];
        return acc;
    }, {})
}
