import { TimeUnit } from "../benchmark/time";

export interface BenchmarkOptions {
	statistics?: {
		mean?: boolean;
		moe?: boolean;
		stderr?: boolean;
		median?: boolean;
		min?: boolean;
		max?: boolean;
	};
	warmup?: {
		enable?: boolean;
		maxTime?: number;
		allowJIT?: boolean;
	};
	measure?: {
		cycles?: number;
		saveTimes?: boolean;
	};
	overhead?: {
		enable?: boolean;
	};
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
}

export const DefaultBenchmarkOptions: BenchmarkOptions = {
	statistics: {
		mean: true,
		moe: true,
		stderr: true,
		median: true,
		min: true,
		max: true
	},
	warmup: {
		enable: true,
		maxTime: 500 * TimeUnit.Millisecond,
		allowJIT: true
	},
	measure: {
		cycles: 100,
		saveTimes: false
	},
	overhead: {
		enable: true
	}
};
export const DefaultBenchmarkManagerOptions: BenchmarkManagerOptions = {
	runParallel: false,
	printTree: true
};
export const DefaultCLIOptions: CLIOptions = {
	verbose: false,
	quiet: false,
	pattern: "*.bench.js",
	path: "./"
};
