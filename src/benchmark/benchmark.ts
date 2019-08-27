import process from "process";
import _ from "lodash";
import { calculateMedian, calculateMarginOfError, calculateStandardError, getOptimizationStats, plotData } from "./util";
import v8natives from "v8-natives";
import { BenchmarkOptions } from "../config/options";

/**
 * Benchmark is responsible for the actual benchmarking.
 * It measures the times, warms the v8 up, saves and interpretes results
 */
export default class Benchmark {

	public id: string;

	public constructor(
		name: string,
		fn: Function,
		filename?: string,
		options: BenchmarkOptions = {}
	) {
		this.name = name;
		this.fn = fn;
		if (filename) {
			this.filename = filename;
		}
		this.options = options;
	}

	public run() {
		if (!this.options.warmup.allowJIT) {
			const neverOptimize = () => { this.fn(); };
			v8natives.neverOptimizeFunction(neverOptimize);
			this.fn = neverOptimize;
		}
		this.warmup = this.getWarmup();
		this.overhead = this.getOverhead();
		this.results = this.getMeasurement();
		if (this.options.overhead.enable) {
			this.deductOverhead();
		}

		return this.results;
	}

	public name: string;
	public filename: string;
	public results: MeasurementResult;
	public options: BenchmarkOptions;
	public fn: Function;
	public warmup: number;
	public overhead: number;

	private getWarmup() {
		if (!this.options.warmup.enable) {
			return 0;
		}

		let iterations = 1;
		let total = 0;
		const times: Array<{ time: number, iterations: number }> = [];
		do {
			iterations = Math.ceil(iterations * this.options.warmup.increaseFactor);
			const startTime = getTime();
			for (let i = 0; i < iterations; i++) {
				this.fn();
			}
			const endTime = getTime();
			total = endTime - startTime;
			const currentTime = (endTime - startTime) / iterations;
			times.push({ time: currentTime, iterations: iterations });
		} while (total < this.options.warmup.maxTime);
		const min = _.minBy(times, (t) => t.time);
		const best = _.minBy(_.filter(times, (t) => t.time / min.time < 1.1), (t) => t.iterations);

		return _.maxBy(times, (t) => t.iterations).iterations;
	}

	private getOverhead() {
		// tslint:disable-next-line: no-empty
		return this.getMeasurement(() => { }).mean;
	}

	private deductOverhead() {
		this.results.max -= this.overhead;
		this.results.mean -= this.overhead;
		this.results.median -= this.overhead;
		this.results.min -= this.overhead;
		this.results.times.map((t) => t - this.overhead);
	}

	private getMeasurement(fn = this.fn): MeasurementResult {
		let times = [];
		let warmup = this.warmup;
		v8natives.optimizeFunctionOnNextCall(fn);
		while (warmup--) {
			fn();
		}

		let cycles = this.options.measure.cycles;
		while (cycles--) {
			let inner = this.warmup;
			times.push(getTime());
			while (inner--) {
				fn();
			}
			times.push(getTime());
		}

		const actualTimes = [];
		for (let i = 0, l = times.length; i < l; i += 2) {
			actualTimes.push((times[i + 1] - times[i]) / this.warmup);
		}
		times = actualTimes;

		return {
			marginOfError: calculateMarginOfError(times, 99.9),
			min: _.min(times),
			max: _.max(times),
			median: calculateMedian(times),
			standardError: calculateStandardError(times),
			mean: _.mean(times),
			times: this.options.measure.saveTimes === true ? times : []
		};
	}
}

/**
 * Gets the current time using process.hrtime
 * @returns A timestamp in nanoseconds
 */
function getTime(): number {
	const time = process.hrtime();
	return time[0] * 1e9 + time[1];
}

export interface MeasurementResult {
	marginOfError?: number;
	min?: number;
	max?: number;
	median?: number;
	standardError?: number;
	mean?: number;
	times?: number[];
}
