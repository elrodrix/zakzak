import { BenchmarkOptions, DefaultBenchmarkOptions } from "./config/options";
import { SuiteManager } from "suite/suite-manager";

export { };

declare global {
	/**
	 * Used to define an enclosing suite inside a benchmark file. Multiple suites can be neighbours and/or nested
	 * @param name Name of the Suite
	 * @param fn Suite or benchmark inside this suite
	 * @param options Options that will be applied to all  benchmarks enclosed in this suite
	 */
	function suite(name: string, fn: Function, options?: BenchmarkOptions): void;

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
_global.suite = (name: string, fn: Function, options: BenchmarkOptions = DefaultBenchmarkOptions) => {
	const mng = SuiteManager.getInstance();
	mng.addSuite(name, fn, options);
};
_global.benchmark = (name: string, fn: Function, options: BenchmarkOptions = DefaultBenchmarkOptions) => {
	const mng = SuiteManager.getInstance();
	mng.addBenchmark(name, fn, options);
};
