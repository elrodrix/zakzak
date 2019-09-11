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
	runParallel: 1,
	pattern: "./*.benchmark.js",
	path: "./",
	exporter: ["console"],
	config: "./zakzak.config.json"
};

