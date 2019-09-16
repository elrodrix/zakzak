import { BenchmarkOptions } from "./config";

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

export { TimeUnit } from "./time";
export { SuiteManager, Suite } from "./suite";
export { BenchmarkManager } from "./manager";
export { ExportManager, ConsoleExporter, JsonExporter, CsvExporter, XmlExporter, ConsoleAsyncExporter, Exporter } from "./exporter";
export { OptionsManager, DefaultBenchmarkOptions, DefaultBenchmarkManagerOptions, OptionsWrapper, BenchmarkManagerOptions, BenchmarkOptions } from "./config";
export { CLIManager } from "./cli";
export { Analytics, ConfidenceLevel, FullAnalysis, BenchmarkProcess, Benchmark, BenchmarkResult, ChildProcessHandler, StartMessage, ExitMessage, Timer } from "./benchmark";
