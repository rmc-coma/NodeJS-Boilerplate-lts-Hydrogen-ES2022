export type Primitive =
    | string
    | number
    | bigint
    | boolean
    | symbol
    | undefined
    | object
    | null;
export type TypeOfValues =
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function";

export type Nullable<T> = T extends null | undefined ? T : never;
