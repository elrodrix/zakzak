import { TimeUnit } from "../benchmark/time";

export interface BenchmarkOptions {
	warmup?: {
		enable?: boolean;
		maxTime?: number;
		increaseFactor?: number;
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
	warmup: {
		enable: true,
		maxTime: 500 * TimeUnit.Millisecond,
		increaseFactor: 2,
		allowJIT: true
	},
	measure: {
		cycles: 100,
		saveTimes: true
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
