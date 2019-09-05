import TimeUnit from "@timeunit";

export interface BenchmarkOptions {
	warmup?: {
		enable?: boolean;
		minTime?: number;
		minSamples?: number;
		maxTime?: number;
		maxSamples?: number;
		allowJIT?: boolean;
	};
	measure?: {
		saveTimes?: boolean;
	};
	overhead?: {
		enable?: boolean;
	};
	maxTries?: number;
}
export interface BenchmarkManagerOptions {
	runParallel?: boolean;
	printTree?: boolean;
}
export interface CLIOptions {
	verbose?: boolean;
	quiet?: boolean;
	pattern?: string;
	path?: string;
	exporter?: string;
}

export interface OptionsWrapper {
	benchmark: BenchmarkOptions;
	manager: BenchmarkManagerOptions;
	cli: CLIOptions;
}

export const DefaultBenchmarkOptions: BenchmarkOptions = {
	warmup: {
		enable: true,
		minTime: 50 * TimeUnit.Millisecond,
		minSamples: 5,
		maxTime: 5 * TimeUnit.Second,
		maxSamples: 5,
		allowJIT: true
	},
	measure: {
		saveTimes: true
	},
	overhead: {
		enable: true
	},
	maxTries: 3
};
export const DefaultBenchmarkManagerOptions: BenchmarkManagerOptions = {
	runParallel: false,
	printTree: true
};
export const DefaultCLIOptions: CLIOptions = {
	verbose: false,
	quiet: false,
	pattern: "*.bench.js",
	path: "./",
	exporter: ""
};
