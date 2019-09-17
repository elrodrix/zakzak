import { TimeUnit } from "../time";

/**
 * Options that can be applied to a benchmark.
 * Can be applied to suites too, they will pass them down to a benchmark
 */
export interface BenchmarkOptions {
	/**
	 * The minimum time that the warmup procedure has to be run.
	 * Also the minimum time for a single cycle.
	 */
	minTime?: number;
	/**
	 * The minimum amount of samples that have to be collected
	 */
	minSamples?: number;
	/**
	 * The maximum time allowed for taking samples
	 */
	maxTime?: number;
	/**
	 * The maximum amount of samples that should be collected
	 */
	maxSamples?: number;
}

/**
 * Options for managing part of the benchmarking framework.
 * Contains options for the Suite- and Benchmarkmanager
 */
export interface BenchmarkManagerOptions {
	/**
	 * Amount of benchmarks to run in parallel.
	 * If the number is smaller than or equal to 1, they will be run in series
	 */
	runParallel?: number;
	/**
	 * Glob pattern that matches the files containing the benchmarks
	 */
	pattern?: string;
	/**
	 * Path from which glob will search for files
	 */
	path?: string;
	/**
	 * List of exporters that will output the benchmark data.
	 * Default ones are `console`, `console-async`, `xml`, `json` and `csv`.
	 * Otherwise a path to an exporter file.
	 */
	exporter?: string[];
	/**
	 * Path to the config file
	 */
	config?: string;
}

/**
 * Wrapper interface for the benchmark and manager options
 */
export interface OptionsWrapper {
	benchmark: BenchmarkOptions;
	manager: BenchmarkManagerOptions;
}

/**
 * The default benchmark options
 */
export const DefaultBenchmarkOptions: BenchmarkOptions = {
	minTime: 50 * TimeUnit.Millisecond,
	minSamples: 5,
	maxTime: 5 * TimeUnit.Second,
	maxSamples: 5000
};

/**
 * The default benchmarkmanager options
 */
export const DefaultBenchmarkManagerOptions: BenchmarkManagerOptions = {
	runParallel: 1,
	pattern: "./**/*.benchmark.js",
	path: "./",
	exporter: ["console"],
	config: "./zakzak.config.json"
};

