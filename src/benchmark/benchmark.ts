import _ from "lodash";

import { Timer } from "./timer";
import { Analytics, FullAnalysis } from "./analytics";
import { BenchmarkOptions } from "../config";

/**
 * Benchmark is responsible for the actual benchmarking.
 * It measures the times, warms the function up, saves and interpretes results
 */
export class Benchmark {
	/**
	 * Creates a new benchmark
	 * @param id Uniquely identifiable id of the benchmark.
	 * Composed of Filename, parent suites and benchmarkname, separated by colons
	 * @param name Name of the benchmark
	 * @param fn Function that will be benchmarked
	 * @param filepath Path of the file, where the benchmark resides
	 * @param options Options for the benchmark
	 */
	public constructor(
		public id: string,
		public name: string,
		public fn: Function,
		public filepath: string,
		public options: BenchmarkOptions
	) { }

	/**
	 * Start the benchmark
	 */
	public start(): BenchmarkResult {
		// Get tiniest possible measurement
		const timerResolution = Timer.getResolution();

		// Calculate size of target measurement using the resolution
		let minTime = Analytics.reduceUncertainty(timerResolution, 0.01);
		minTime = Math.max(minTime, this.options.minTime);	// take biggest minTime

		// Get optimal cycle count possible in minTime and then collect samples
		const optimalCount = this.getMaxCycles(minTime);
		const samples = this.getSamples(optimalCount).map((sample) => sample / optimalCount);

		const stats = Analytics.getFullAnalysis(samples);

		return {
			id: this.id,
			name: this.name,
			filename: this.filepath,
			stats: stats,
			count: optimalCount,
			times: samples,
			options: this.options
		};
	}

	/**
	 * Apply options to existing options, overriding values that exist in old options
	 * @param options The new options
	 */
	public changeOptions(options: BenchmarkOptions) {
		this.options = _.merge({}, this.options, options);
	}

	/**
	 * Estimates max amount of cycles that is possible before minTime is reached
	 * @param minTime Minimum time that one complete sample can take
	 */
	private getMaxCycles(minTime: number): number {
		let result = { count: 1, finished: false }; // Start values

		// Save result and repeat until finished == true
		while ((result = this.cycle(result.count, minTime)).finished === false) { }

		return result.count;
	}

	/**
	 * Execute function for specified amount of times,
	 * then estimate how many more times would be possible until minTime ist reached.
	 * Sets `finished=true` when minTime is reached.
	 * @param count Amount of times the function should be repeated
	 * @param minTime The minTime which should be reached
	 */
	private cycle(count: number, minTime: number) {
		const time = this.execute(count); // Time spent executing the function for count times
		const period = time / count; // Average time for a single execution
		const timeLeft = (minTime - time); // Time left until minTime is reached

		// Calculate nextCount based on how often period fits into timeLeft
		const nextCount = time <= 0 ? count * 100 : Math.floor(timeLeft / period);

		if (time <= minTime) {
			return { count: nextCount, finished: false };
		} else { // If minTime is reached
			return { count: count, finished: true };
		}
	}

	/**
	 * Execute function for specified amount of times
	 * @param count Amount of times the function should be repeated
	 */
	private execute(count: number): number {
		const fn = this.fn;
		const start = Timer.getTime();
		while (count--) {
			fn();
		}
		const end = Timer.getTime();

		return end - start;
	}


	/**
	 * Executes function for specified amount of times, amounting to a single sample.
	 * Repeats the process until maxTime or maxSamples is reached.
	 * @param count Amount of times the function should be repeated
	 */
	private getSamples(count: number): number[] {
		const samples: number[] = [];
		const maxTime = this.options.maxTime;
		const maxSamples = this.options.maxSamples;
		let cycles = this.options.minSamples;

		// Collect the minimum amount of samples
		while (cycles--) {
			const time = this.execute(count);
			samples.push(time);
		}

		// Collect more samples until maxTime or maxSamples is reached
		while (_.sum(samples) < maxTime && samples.length <= maxSamples) {
			const time = this.execute(count);
			samples.push(time);
		}

		return samples;
	}
}

/**
 * The result of a successful benchmark
 */
export interface BenchmarkResult {
	id: string;
	name: string;
	filename: string;
	stats: FullAnalysis;
	times: number[];
	count: number;
	options: BenchmarkOptions;
}
