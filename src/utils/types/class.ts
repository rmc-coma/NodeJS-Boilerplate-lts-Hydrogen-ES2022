import type { GenericFunction } from "./function";

export type GenericClass = new (...args: unknown[]) => unknown;
export type ClassInstance<T> = T extends new (...args: unknown[]) => infer I ? I : never;

type MethodsNames<C extends InstanceType<GenericClass>> = {
    [K in keyof C]: C[K] extends GenericClass
        ? K
        : C[K] extends GenericFunction
        ? K
        : never;
}[keyof C];

export type ClassMethods<C extends InstanceType<GenericClass>> = Pick<C, MethodsNames<C>>;
export type ClassProperties<C extends InstanceType<GenericClass>> = Omit<
    C,
    MethodsNames<C>
>;
