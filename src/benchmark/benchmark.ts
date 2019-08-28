import process from "process";
import _ from "lodash";
import { calculateMedian, calculateMarginOfError, calculateStandardError, getOptimizationStats, plotData, isWithin } from "./util";
import v8natives from "v8-natives";
import { BenchmarkOptions } from "../config/options";
import { ExportEmitter } from "../manager/exporter/emitter";

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
		this.em.debug(`creating new benchmark ${name}`);
		this.name = name;
		this.fn = fn;
		if (filename) {
			this.filename = filename;
		}
		this.options = options;
	}

	public run() {
		this.em.debug(`running benchmark ${this.name}`);
		if (!this.options.warmup.allowJIT) {
			const fn = this.fn;
			this.em.debug("wrapping function and disabling optimization for it");
			const neverOptimize = () => { fn(); };
			v8natives.neverOptimizeFunction(neverOptimize);
			this.fn = neverOptimize;
		}

		this.em.debug("starting core part of the benchmark");
		do {
			this.warmup = this.getWarmup();
			this.overhead = this.getOverhead();
			this.results = this.getMeasurement();
			if (this.options.overhead.enable) {
				this.deductOverhead();
			}
		} while (!this.areResultsAcceptable());

		this.em.debug(`finished benchmark ${this.name}`);
		return this.results;
	}

	public name: string;
	public filename: string;
	public results: MeasurementResult;
	public options: BenchmarkOptions;
	public fn: Function;
	public warmup: number;
	public overhead: number;

	private em = ExportEmitter.getInstance();

	private getWarmup() {
		if (!this.options.warmup.enable) {
			this.em.debug("warmup 0 due to warmup disabled in options");
			return 0;
		}

		let total = 0;

		let startTime = 0;
		this.warmup = 1;
		this.em.debug("starting warmup estimation process");
		do {
			this.em.debug("deoptimizing function");
			v8natives.deoptimizeFunction(this.fn);
			v8natives.deoptimizeNow();
			this.em.debug("increasing warmup time");
			startTime = getTime();
			this.warmup = Math.ceil(this.warmup * this.options.warmup.increaseFactor);
			const results = this.getMeasurement();
			total += this.warmup + (this.options.measure.cycles * this.warmup);
			if (this.areResultsAcceptable(results)) {
				this.em.debug("warmup measurement results are within acceptable range");
				return total;
			}

		} while ((getTime() - startTime) < this.options.warmup.maxTime);

		this.em.debug("warmup hit maxtime duration");
		return total;
	}

	private getOverhead() {
		this.em.debug("measuring benchmarking overhead");
		// tslint:disable-next-line: no-empty
		return this.getMeasurement(() => { }).mean;
	}

	private deductOverhead() {
		this.em.debug("deducting calculated overhead from results");
		this.results.max -= this.overhead;
		this.results.mean -= this.overhead;
		this.results.median -= this.overhead;
		this.results.min -= this.overhead;
		this.results.times.map((t) => t - this.overhead);
	}

	private getMeasurement(fn = this.fn): MeasurementResult {
		this.em.debug("starting measurement");
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

		this.em.debug("finished measurement");

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
		this.em.debug("checking if measurement results are acceptable");
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
