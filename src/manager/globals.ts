import BenchmarkManager from "./benchmark-manager";
import Structure from "./structure";
import Benchmark from "./../benchmark/benchmark";
import { BenchmarkOptions } from "../config/options";

export { };

declare global {
	/**
	 * Used to define an enclosing structure inside a benchmark file. Multiple structures can be neighbours and/or nested
	 * @param name Name of the structure
	 * @param callback Structure or benchmark inside this structure
	 * @param options Options that will be applied to all  benchmarks enclosed in this structure
	 */
	function structure(name: string, callback: Function, options?: BenchmarkOptions): void;

	/**
	 * Used to define an benchmark
	 * @param name Name of the benchmark
	 * @param callback Function that will be benchmarked
	 * @param options Options that will be applied for this specific benchmark
	 */
	function benchmark(name: string, callback: Function, options?: BenchmarkOptions): void;
}

// tslint:disable-next-line: variable-name
const _global = global as any;
_global.structure = (name: string, callback: Function, options?: BenchmarkOptions) => {
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

// type StructureFunction = (name: string, callback: StructureFunction | BenchmarkFunction, options?: BenchmarkOptions) => void;
// type BenchmarkFunction = (name: string, callback: Function, options?: BenchmarkOptions) => void;
