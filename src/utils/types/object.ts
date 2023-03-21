import type { falsy } from "./boolean";

export type GenericRecord<T = unknown> = { [P in keyof T]: T[P] };

export type EmptyRecord = { [P in PropertyKey]: never };

export type StrictMap<T extends GenericRecord> = {
    [P in keyof T]: T[P] extends undefined ? never : Exclude<T[P], undefined>;
};

export type PartiallyUndefined<T> = {
    [P in keyof T]?: T[P] | undefined;
};

export type RequiredExcept<T, K extends keyof T> = {
    [P in Extract<keyof T, K>]?: T[P];
} & {
    [P in Exclude<keyof T, K>]-?: T[P];
};

export type PartialExcept<T, K extends keyof T> = {
    [P in Exclude<keyof T, K>]?: T[P];
} & {
    [P in Extract<keyof T, K>]-?: T[P];
};

/** @description From T, pick a set of properties which types are in K */
export type Grab<T extends GenericRecord, U> = Pick<
    T,
    {
        [P in keyof T]: T[P] extends U ? P : never;
    }[keyof T]
>;

/** @description Construct a type with the properties of T except for those which type is in type K. */
export type Strip<T extends GenericRecord, U> = Pick<
    T,
    {
        [P in keyof T]: T[P] extends U ? never : P;
    }[keyof T]
>;

/** @description Construct a type with the properties of T except for those which are undefined. */
export type StripUndefined<T extends GenericRecord> = Pick<
    T,
    {
        [P in keyof T]: T[P] extends undefined ? never : P;
    }[keyof T]
>;

/** @description Construct a type with the properties of T except for those which are null. */
export type StripNull<T extends GenericRecord> = Pick<
    T,
    {
        [P in keyof T]: T[P] extends null ? never : P;
    }[keyof T]
>;

/** @description Construct a type with the properties of T except for those which are null or undefined. */
export type StripNil<T extends GenericRecord> = Pick<
    T,
    {
        [P in keyof T]: T[P] extends null | undefined ? never : P;
    }[keyof T]
>;

type OptionalPropertiesNames<T extends GenericRecord> = {
    [P in keyof T]-?: { [A in P]?: T[P] } extends { [A in P]: T[P] } ? P : never;
}[keyof T];

export type GrabOptional<T extends GenericRecord> = Pick<T, OptionalPropertiesNames<T>>;
export type StripRequired<T extends GenericRecord> = Omit<
    T,
    Exclude<keyof T, OptionalPropertiesNames<T>>
>;
export type GrabRequired<T extends GenericRecord> = Pick<
    T,
    Exclude<keyof T, OptionalPropertiesNames<T>>
>;
export type StripOptional<T extends GenericRecord> = Omit<T, OptionalPropertiesNames<T>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & {
    [P in K]?: T[P] | undefined;
};

export type Full<T> = Exclude<T, undefined>;

/*
 ! Experimental
 */
export type Conditional<T, U = T, V = U | undefined | never> = T extends falsy ? V : U;
export type WhenNotUndefined<T, U = T, V = U | undefined | never> = T extends undefined
    ? V
    : U;

/** @description Allows to view a 'T' discriminated union when its type at index 'DiscriminantKey' is of 'DiscriminantValue' type */
export type Constrained<
    T extends GenericRecord,
    DiscriminantKey extends keyof T,
    DiscriminantValue extends T[DiscriminantKey]
> = T extends { [P in DiscriminantKey]: DiscriminantValue } ? T : never;

/** @description Allows to genericly view a 'T' discriminated union when its type at index 'DiscriminantKey' is of 'DiscriminantValue' type */
export type GenericlyConstrained<
    T extends GenericRecord,
    DiscriminantKey extends keyof T,
    DiscriminantValue extends T[DiscriminantKey]
> = T[DiscriminantKey] extends DiscriminantValue ? T : never;

/** @description Allows to view a 'T' discriminated union when its type at index 'DiscriminantKey' is all but 'DiscriminantValue' type */
export type NotConstrained<
    T extends GenericRecord,
    DiscriminantKey extends keyof T,
    DiscriminantValue extends T[DiscriminantKey]
> = T extends { [P in DiscriminantKey]: Exclude<T[DiscriminantKey], DiscriminantValue> }
    ? T
    : never;

export type GenericlyNotConstrained<
    T extends GenericRecord,
    DiscriminantKey extends keyof T,
    DiscriminantValue extends T[DiscriminantKey]
> = T[DiscriminantKey] extends DiscriminantValue ? never : T;
