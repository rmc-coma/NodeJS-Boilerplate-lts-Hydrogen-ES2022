export type GenericArray = Array<unknown>;
export type ArrayValue<T> = T extends Iterable<infer U> | ArrayLike<infer U> ? U : never;
