import React from "react";

/** Comparison function for numbers expected by `Array.sort` */
export function compareNumbers(a: number, b: number): number {
    return a - b;
}

/** An array or single element */
export type ArrayOrElem<T> = T | Array<T>;
/** Convert a `ArrayOrElem` into an `Array` */
export function ensureArray<T>(array: ArrayOrElem<T>): Array<T> {
    return array instanceof Array ? array : [array];
}

/** Arbitrary react element which contains a flat list of children of a single type */
export type ContainsChildren<Child> = React.ReactElement<{
    children: ArrayOrElem<Child>;
}>;
