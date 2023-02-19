export function compareNumbers(a: number, b: number): number {
    return a - b;
}

export type ArrayOrElem<T> = T | Array<T>;
export function ensureArray<T>(array: ArrayOrElem<T>): Array<T> {
    return array instanceof Array ? array : [array];
}
