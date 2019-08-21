export { };

declare global {
	function structure(name: string, callback: Function, options?: StructureOptions): void;
	function benchmark(name: string, callback: Function, options?: BenchmarkOptions): void;
	interface BenchmarkOptions {
		maxCycleTime?: number;
		maxCycleNumber?: number;
		allowJIT?: boolean;
	}
	interface StructureOptions {
		benchmarkOptions: BenchmarkOptions;
	}
}

// tslint:disable-next-line: variable-name
const _global = global as any;
_global.structure = (name: string, callback: Function, options?: StructureOptions) => {
	console.log(`structure!!! ${name}`);
};
_global.benchmark = (name: string, callback: Function, options?: BenchmarkOptions) => {
	console.log(`benchmark!!! ${name}`);
};
