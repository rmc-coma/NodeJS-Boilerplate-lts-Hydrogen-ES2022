export type GenericTuple = readonly [unknown, ...unknown[]];
export type Tuple<T> = readonly [T, ...T[]];

export type PartialTuple<T extends readonly unknown[]> = T extends [infer U, ...infer V]
    ? (V["length"] extends 0 ? [U] : [U, ...PartialTuple<V>] | [U]) | []
    : never;

export type ReversePartialTuple<T extends readonly unknown[]> = T extends [
    ...infer U,
    infer V
]
    ? (U["length"] extends 0 ? [V] : [...ReversePartialTuple<U>, V] | [V]) | []
    : never;

/**
 * @description Turns a tuple into a union
 * @example ['a', 'b', 'c'] => 'a' | 'b' | 'c'
 */
export type Union<T> = T extends readonly [infer U, ...infer V]
    ? V["length"] extends 0
        ? U
        : U | Union<V>
    : never;

/**
 * @description Turns a tuple into an intersection
 * @example ['a', 'b', 'c'] => 'a' & 'b' & 'c'
 */
export type Intersection<T> = T extends readonly [infer U, ...infer V]
    ? V["length"] extends 0
        ? U
        : U & Intersection<V>
    : never;
