import process from "process";
import _ from "lodash";
import { calculateMedian, calculateMarginOfError, calculateStandardError, getOptimizationStats, plotData, isWithin } from "./util";
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
			const fn = this.fn;
			const neverOptimize = () => { fn(); };
			v8natives.neverOptimizeFunction(neverOptimize);
			this.fn = neverOptimize;
		}

		do {
			this.warmup = this.getWarmup();
			this.overhead = this.getOverhead();
			this.results = this.getMeasurement();
			if (this.options.overhead.enable) {
				this.deductOverhead();
			}
		} while (!this.areResultsAcceptable());

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

		let total = 0;

		let startTime = 0;
		this.warmup = 1;
		do {
			v8natives.deoptimizeFunction(this.fn);
			v8natives.deoptimizeNow();
			startTime = getTime();
			this.warmup = Math.ceil(this.warmup * this.options.warmup.increaseFactor);
			const results = this.getMeasurement();
			total += this.warmup + (this.options.measure.cycles * this.warmup);
			if (this.areResultsAcceptable(results)) {
				break;
			}

		} while ((getTime() - startTime) < this.options.warmup.maxTime);

		return total;
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

	private areResultsAcceptable(results: MeasurementResult = this.results) {
		return results.marginOfError <= (results.mean * 0.1) && isWithin(results.median, results.mean, 0.1);
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
