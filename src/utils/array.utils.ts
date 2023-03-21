export async function asyncMap<T, U>(
    array: readonly T[],
    callbackfn: (value: T, index: number, innerArray: readonly T[]) => Promise<U>,
    parallelized = false
): Promise<U[]> {
    if (parallelized) {
        return Promise.all(array.map(callbackfn));
    }
    const newArray = new Array<U>();
    const arrayEntriesIterator = array.entries();
    for (const [index, value] of arrayEntriesIterator) {
        newArray[index] = await callbackfn(value, index, array);
    }
    return newArray;
}

export async function asyncForEach<T>(
    array: readonly T[],
    callbackfn: (value: T, index: number, innerArray: readonly T[]) => Promise<void>,
    parallelized = false
): Promise<void> {
    if (parallelized) {
        await Promise.all(array.map(callbackfn));
    } else {
        const arrayEntriesIterator = array.entries();
        for (const [index, value] of arrayEntriesIterator) {
            await callbackfn(value, index, array);
        }
    }
}

export async function asyncReduce<T, U>(
    array: readonly T[],
    callbackfn: (
        previousValue: U,
        currentValue: T,
        currentIndex: number,
        innerArray: readonly T[]
    ) => Promise<U>,
    initialValue: U
): Promise<U> {
    const arrayEntriesIterator = array.entries();
    for (const [index, value] of arrayEntriesIterator) {
        initialValue = await callbackfn(initialValue, value, index, array);
    }
    return initialValue;
}

export async function asyncFind<T>(
    array: readonly T[],
    callbackfn: (value: T, index: number, innerArray: readonly T[]) => Promise<boolean>
): Promise<T | undefined> {
    const arrayEntriesIterator = array.entries();
    for (const [index, value] of arrayEntriesIterator) {
        if (await callbackfn(value, index, array)) {
            return value;
        }
    }
    return undefined;
}

export async function asyncEvery<T>(
    array: readonly T[],
    predicate: (value: T, index: number, array: readonly T[]) => Promise<boolean>
): Promise<boolean> {
    const arrayEntriesIterator = array.entries();
    for (const [index, value] of arrayEntriesIterator) {
        if (!(await predicate(value, index, array))) {
            return false;
        }
    }
    return true;
}

export async function asyncSome<T>(
    array: readonly T[],
    predicate: (value: T, index: number, array: readonly T[]) => Promise<boolean>
): Promise<boolean> {
    const arrayEntriesIterator = array.entries();
    for (const [index, value] of arrayEntriesIterator) {
        if (await predicate(value, index, array)) {
            return true;
        }
    }
    return false;
}
