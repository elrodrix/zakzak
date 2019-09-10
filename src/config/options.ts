import { TimeUnit } from "@timeunit";

export interface BenchmarkOptions {
	/**
	 * The minimum time, that the warmup procedure has to be run.
	 * Also the minimum time for a single cycle.
	 */
	minTime?: number;
	/**
	 * The minimum amount of samples and therefore cycles the benchmark has to run
	 */
	minSamples?: number;
	/**
	 * The maximum time for taking samples and running cycles
	 */
	maxTime?: number;
	/**
	 * The maximum amount of samples the benchmark should take
	 */
	maxSamples?: number;
}
export interface BenchmarkManagerOptions {
	/**
	 * If benchmarks should be run parallel or in series
	 */
	runParallel?: boolean;
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
	 * Default ones are `console`, `xml`, `json` and `csv`.
	 * Otherwise a path to an exporter file.
	 */
	exporter?: string[];
	/**
	 * Path to the config file
	 */
	config?: string;
}

export interface OptionsWrapper {
	benchmark: BenchmarkOptions;
	manager: BenchmarkManagerOptions;
}

export const DefaultBenchmarkOptions: BenchmarkOptions = {
	minTime: 50 * TimeUnit.Millisecond,
	minSamples: 5,
	maxTime: 5 * TimeUnit.Second,
	maxSamples: 5000
};
export const DefaultBenchmarkManagerOptions: BenchmarkManagerOptions = {
	runParallel: false,
	pattern: "./*.benchmark.js",
	path: "./",
	exporter: ["console"]
};

