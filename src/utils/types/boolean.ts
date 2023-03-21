import type { Primitive } from "./primitive";

export type falsy = false | 0 | "" | undefined | null; // Should include NaN but typeof NaN is number and we don't want to exclude all the numbers
export type truthy = Exclude<Primitive, falsy>;
