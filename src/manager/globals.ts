import BenchmarkManager from "./manager";
import Structure from "./structure";
import Benchmark from "./../benchmark/benchmark";

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
	const s = new Structure(name, callback, undefined, options);
	const mng = BenchmarkManager.getInstance();
	mng.addStructure(s);
	return s;
};
_global.benchmark = (name: string, callback: Function, options?: BenchmarkOptions) => {
	const b = new Benchmark(name, callback, undefined, options);
	const mng = BenchmarkManager.getInstance();
	mng.addBenchmark(b);
	return b;
};
