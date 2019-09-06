import _ from "lodash";
import { BenchmarkOptions } from "@zakzak/config/options";
import { Timer } from "./timer";
import { Analytics, FullAnalysis } from "./analytics";

/**
 * Benchmark is responsible for the actual benchmarking.
 * It measures the times, warms the v8 up, saves and interpretes results
 */
export class Benchmark {
	public constructor(
		public id: string,
		public name: string,
		public fn: Function,
		public filename: string,
		public options: BenchmarkOptions
	) { }

	public start(): BenchmarkResult {
		const timerResolution = Timer.getResolution();
		let minTime = Analytics.reduceUncertainty(timerResolution, 0.01);
		minTime = Math.max(minTime, this.options.warmup.minTime);

		const optimalCount = this.cycle(minTime);
		const samples = this.getSamples(optimalCount).map((sample) => sample / optimalCount);

		const stats = Analytics.getFullAnalysis(samples);

		return {
			id: this.id,
			name: this.name,
			filename: this.filename,
			stats: stats,
			count: optimalCount,
			times: samples,
			options: this.options
		};
	}

	public changeOptions(options: BenchmarkOptions) {
		this.options = _.merge({}, this.options, options);
	}

	private cycle(minTime: number): number {
		const doCycle = (count: number) => {
			const time = this.execute(count);
			const period = time / count;
			const timeLeft = (minTime - time);
			const nextCount = time <= 0 ? count * 100 : Math.floor(timeLeft / period);

			if (time <= minTime) {
				return { count: nextCount, finished: false };
			} else {
				return { count: count, finished: true };
			}
		};
		let result = { count: 1, finished: false };
		while ((result = doCycle(result.count)).finished === false) { }
		return result.count;
	}

	private execute(count: number): number {
		const fn = this.fn;
		const start = Timer.getTime();
		while (count--) {
			fn();
		}
		const end = Timer.getTime();

		return end - start;
	}

	private getSamples(count: number): number[] {
		const samples: number[] = [];
		const maxTime = this.options.warmup.maxTime;
		const maxSamples = this.options.warmup.maxSamples;
		let cycles = this.options.warmup.minSamples;
		while (cycles--) {
			const time = this.execute(count);
			samples.push(time);
		}
		while (_.sum(samples) < maxTime && samples.length <= maxSamples) {
			const time = this.execute(count);
			samples.push(time);
		}

		return samples;
	}
}

export interface BenchmarkResult {
	id: string;
	name: string;
	filename: string;
	stats: FullAnalysis;
	times: number[];
	count: number;
	options: BenchmarkOptions;
}
