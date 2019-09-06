import { BenchmarkOptions, DefaultBenchmarkOptions } from "./config/options";
import { StructureManager } from "@zakzak/structure/structure-manager";

export { };

declare global {
	/**
	 * Used to define an enclosing structure inside a benchmark file. Multiple structures can be neighbours and/or nested
	 * @param name Name of the structure
	 * @param fn Structure or benchmark inside this structure
	 * @param options Options that will be applied to all  benchmarks enclosed in this structure
	 */
	function structure(name: string, fn: Function, options?: BenchmarkOptions): void;

	/**
	 * Used to define an benchmark
	 * @param name Name of the benchmark
	 * @param fn Function that will be benchmarked
	 * @param options Options that will be applied for this specific benchmark
	 */
	function benchmark(name: string, fn: Function, options?: BenchmarkOptions): void;
}

// tslint:disable-next-line: variable-name
const _global = global as any;
_global.structure = (name: string, fn: Function, options: BenchmarkOptions = DefaultBenchmarkOptions) => {
	const mng = StructureManager.getInstance();
	mng.addStructure(name, fn, options);
};
_global.benchmark = (name: string, fn: Function, options: BenchmarkOptions = DefaultBenchmarkOptions) => {
	const mng = StructureManager.getInstance();
	mng.addBenchmark(name, fn, options);
};
