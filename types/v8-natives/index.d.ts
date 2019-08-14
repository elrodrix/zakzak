declare module 'v8-natives' {
    export class v8 {
        static printStatus(fn: Function, fName: string): number;
        static testOptimization(f: Function | Function[], fname: string): number;
        static benchmark(count: number, f: Function, params?: any): number;
    }

    export function isNative(): boolean;
    export function getOptimizationStatus(fun: Function): number;
    export function optimizeFunctionOnNextCall(fun: Function): void;
    export function deoptimizeFunction(fun: Function): void;
    export function deoptimizeNow(): void;
    export function ClearFunctionFeedback(fun: Function): void;
    export function debugPrint(data: object): object;
    export function debugTrace(): void;
    export function collectGarbage(): void;
    export function getHeapUsage(): number;
    export function hasFastProperties(data: object): boolean;
    export function hasFastPackedElements(data: object): boolean;
    export function HasSmiElements(data: object): boolean;
    export function hasDoubleElements(data: object): boolean;
    export function hasDictionaryElements(data: object): boolean;
    export function HasHoleyElements(data: object): boolean;
    export function hasSmiOrObjectElements(data: object): boolean;
    export function hasSloppyArgumentsElements(data: object): boolean;
    export function haveSameMap(data1: object, data2: object): boolean;
    export function functionGetName(func: Function): string;
    export function isSmi(data: object): boolean;
    export function isValidSmi(data: object): boolean;
    export function neverOptimizeFunction(func: Function): void;
    export function setFlags(flag: string): void;
    export function traceEnter(): void;
    export function traceExit(val: any): number;
}
