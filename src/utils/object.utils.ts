import type {
    GenericRecord,
    Primitive,
    StripNil,
    StripNull,
    StripUndefined,
    Union,
} from "./types";

export function keyof<T extends GenericRecord>(obj: T): Array<keyof T> {
    return Object.getOwnPropertyNames(obj)
        .reduce((acc, key) => {
            const numberKey = parseFloat(key) as Extract<keyof T, number>;
            if (!Number.isNaN(numberKey) && numberKey.toString() === key) {
                acc.push(numberKey);
            } else {
                acc.push(key as keyof T);
            }
            return acc;
        }, new Array<keyof T>())
        .concat(Object.getOwnPropertySymbols(obj) as Array<keyof T>);
}

export function ownEntries<T extends GenericRecord>(
    obj: T
): Array<readonly [keyof T, T[keyof T]]> {
    return keyof(obj).map(prop => [prop, obj[prop]] as const);
}

export function transform<
    T extends { [P in keyof T]: T[P] },
    U extends { [P in keyof U]: U[P] }
>(
    obj: T,
    cb: <V extends keyof T, W extends keyof U>(
        args: readonly [key: V, value: T[V]],
        index: number,
        array: Array<{ [P in keyof T]: readonly [P, T[P]] }[keyof T]>
    ) => readonly [W, U[W]]
): U {
    return Object.fromEntries(
        (
            Object.entries(obj) as unknown as Array<
                { [P in keyof T]: readonly [P, T[P]] }[keyof T]
            >
        ).map(cb)
    ) as U;
}

/**
 * @description This behaves like JSON.stringify with the exception that it works with recursive objects
 * while also respecting JSON standards by replacing self-references by {$ref} objects
 */
export function stringify(
    arg: unknown | undefined | null,
    options: {
        maxArrayLength?: number;
        maxObjectPropertiesCount?: number;
        maxStringLength?: number;
        maxDepth?: number;
        truncateLineBreaks?: boolean;
        includeFunctionNames?: boolean;
    } = {}
): string {
    const references = new Map<object, string>();
    const stringifyPrimitiveOrDate = (prim: Primitive | Date): string => {
        let str =
            prim === undefined
                ? "undefined"
                : prim === null
                ? "null"
                : (prim as { toJSON?: () => string })?.toJSON?.() ??
                  (typeof prim === "string"
                      ? `"${prim.replace(/"/g, "'")}"`
                      : prim?.toString?.()) ??
                  "unknown";
        if (
            typeof options.maxStringLength === "number" &&
            options.maxStringLength > 0 &&
            str.length > options.maxStringLength
        ) {
            str = `${str.slice(0, options.maxStringLength)}[...]"`;
        }
        if (options.truncateLineBreaks) {
            str = str.replace(/\n/g, "\\n");
        }
        return str;
    };
    const stringifyObject = (
        obj: Record<PropertyKey, unknown>,
        padding = "",
        path = "#",
        depth = 0
    ): string => {
        const isArray = Array.isArray(obj);
        const openerChar = isArray ? "[" : "{";
        const closerChar = isArray ? "]" : "}";
        references.set(obj, path);
        const untruncatedEntries = options.includeFunctionNames
            ? isArray
                ? Object.entries(obj)
                : ownEntries(obj)
            : (isArray ? Object.entries(obj) : ownEntries(obj)).filter(
                  ([_, value]) => typeof value !== "function"
              );
        const maxEntriesLength = isArray
            ? options.maxArrayLength
            : options.maxObjectPropertiesCount;
        const [entries, isTruncated] =
            typeof maxEntriesLength === "number" &&
            maxEntriesLength > 0 &&
            untruncatedEntries.length > maxEntriesLength
                ? [untruncatedEntries.slice(0, maxEntriesLength), true]
                : [untruncatedEntries, false];
        const str = `${openerChar}${
            entries.length > 0
                ? entries.reduce<string>(
                      (acc, [key, value], index, arr) =>
                          [
                              acc,
                              `${`${padding}    `}${isArray ? "" : `"${String(key)}": `}${
                                  options.includeFunctionNames &&
                                  typeof value === "function"
                                      ? `"${value.name}"`
                                      : typeof value === "object" && value !== null
                                      ? references.has(value)
                                          ? `{ "$ref": "${references.get(value)!}" }`
                                          : stringifyObject(
                                                value as Record<PropertyKey, unknown>,
                                                `${padding}    `,
                                                `${path}/${String(key)}`,
                                                depth + 1
                                            )
                                      : stringifyPrimitiveOrDate(
                                            value as Record<PropertyKey, unknown>
                                        )
                              }${index === arr.length - 1 ? "" : ","}`,
                          ].join("\n"),
                      ""
                  ) +
                  (isTruncated
                      ? `,\n${padding}    ...(${(
                            untruncatedEntries.length - entries.length
                        ).toString()} remaining elements)...\n${padding}`
                      : `\n${padding}`)
                : ""
        }${closerChar}`;
        if (typeof options.maxDepth === "number" && options.maxDepth > 0) {
            if (depth === options.maxDepth) {
                return `${openerChar} ...(Max object depth setting (${options.maxDepth}) reached)... ${closerChar}`;
            }
            if (depth > options.maxDepth) {
                return "";
            }
        }
        return str;
    };
    return (
        typeof arg === "object" && arg !== null ? stringifyObject : stringifyPrimitiveOrDate
    )(arg as Record<PropertyKey, unknown>);
}

/**
 * @description Removes from obj the properties whose names are not in keys
 */
export function pick<T extends GenericRecord, K extends Array<keyof T>>(
    obj: T,
    ...keys: K
) {
    return Object.fromEntries(
        ownEntries(obj).filter(([key, _]) => keys.includes(key))
    ) as unknown as {
        [P in Extract<keyof T, Union<K>>]: T[P];
    };
}

/**
 * @description Removes from obj the properties whose names are in keys
 */
export function omit<T extends GenericRecord, K extends Array<keyof T>>(
    obj: T,
    ...keys: K
) {
    return Object.fromEntries(
        ownEntries(obj).filter(([key, _]) => !keys.includes(key))
    ) as unknown as {
        [P in Exclude<keyof T, Union<K>>]: T[P];
    };
}

/**
 * @description Removes from obj properties which value is undefined
 */
export function stripUndefined<T extends GenericRecord>(obj: T): StripUndefined<T> {
    return Object.fromEntries(ownEntries(obj).filter(([_, val]) => val !== undefined)) as T;
}

/**
 * @description Removes from obj properties which value is null
 */
export function stripNull<T extends GenericRecord>(obj: T): StripNull<T> {
    return Object.fromEntries(ownEntries(obj).filter(([_, val]) => val !== null)) as T;
}

/**
 * @description Removes from obj properties which value is nil
 */
export function stripNil<T extends GenericRecord>(obj: T): StripNil<T> {
    return Object.fromEntries(
        ownEntries(obj).filter(([_, val]) => val !== null && val !== undefined)
    ) as T;
}
