import process from "process";
import _ from "lodash";
import { TimeUnit } from "./time";
import { calculateMedian, calculateMarginOfError, calculateStandardError } from "./util";
import v8natives from "v8-natives";

export default class Benchmark {

    /**
     * The margin of error in nanoseconds
     */
    public marginOfError: number;

    /**
     * The sample standard error in nanoseconds
     */
    public standardError: number;

    /**
     * Mean of the measurements in nanoseconds
     */
    public mean: number;

    /**
     * Fastest measurement in nanoseconds
     */
    public min: number;

    /**
     * Slowest measurement in nanoseconds
     */
    public max: number;

    /**
     * Median of the measurements in nanoseconds
     */
    public median: number;

    /**
     * The name of the benchmark
     */
    public name: string;

    /**
     * The options set at the beginning for this benchmark
     */
    private options: BenchmarkOptions;

    public constructor(name: string, private fn: () => void, opts?: BenchmarkOptions) {
        const defaultOptions: BenchmarkOptions = {
            maxCycleTime: 500 * TimeUnit.Millisecond,
            maxCycleNumber: 100,
            allowJIT: true
        };
        this.options = _.merge(defaultOptions, opts)
        this.name = name;

        if (this.options.allowJIT === false) {
            v8natives.neverOptimizeFunction(this.fn);
        }
    }

    /**
     * Do a complete Benchmark run
     */
    public run() {
        const warmupIter = this.estimateWarmup(this.fn);
        const overHead = this.measure(() => { }, warmupIter, 100);
        const time = this.measure(this.fn, warmupIter, 100);
        return Math.max(time - overHead, 0); // incase overhead
    }

    /**
     * Estimates how often the function has the be executed in order to be properly warmed up
     * @param fn Function that should be warmep up
     */
    private estimateWarmup(fn: () => void, maxTime = 500 * TimeUnit.Millisecond) {
        let iterations = 1
        let total = 0;
        let times: { time: number, iter: number }[] = [];
        do {
            iterations *= 2;
            const startTime = Benchmark.getTime();
            for (let i = 0; i < iterations; i++) {
                fn();
            }
            const endTime = Benchmark.getTime();
            total = endTime - startTime;
            let currentTime = (endTime - startTime) / iterations;
            times.push({ time: currentTime, iter: iterations });
            // console.log(`time: ${currentTime} iter: ${iterations}`)
        } while (total < maxTime)
        const min = _.minBy(times, t => t.time);
        const best = _.minBy(_.filter(times, t => t.time / min.time < 1.1), t => t.iter);

        return best.iter;
    }

    /**
     * Measures the function execution time of a function
     * @param fn The function that will be measured
     * @param warmupIterations How often the function needs to be executed, before it is warmed up
     * @param cycleIterations How many cycles should be performed
     */
    private measure(fn: () => void, warmupIterations = 100, cycleIterations = 30) {
        const times = [];
        let warmup = warmupIterations;
        let cycles = cycleIterations;
        let inner = warmupIterations
        while (warmup--) {
            fn();
        }
        while (cycles--) {
            times.push(Benchmark.getTime())
            while (inner--) {
                fn()
            }
            times.push(Benchmark.getTime())
            inner = warmupIterations
        }

        let actualTimes = [];
        for (let i = 0, l = times.length; i < l; i += 2) {
            actualTimes.push((times[i + 1] - times[i]) / warmupIterations);
        }

        this.marginOfError = calculateMarginOfError(actualTimes, 99.9);

        this.min = _.min(actualTimes);
        this.max = _.max(actualTimes);
        this.median = calculateMedian(actualTimes);
        this.standardError = calculateStandardError(actualTimes);

        const execTime = _.mean(actualTimes);
        this.mean = execTime;

        return execTime;
    }

    /**
     * Gets the current time using process.hrtime
     * @returns A timestamp in nanoseconds
     */
    private static getTime(): number {
        const time = process.hrtime();
        return time[0] * 1e9 + time[1];
    }
}

export interface BenchmarkOptions {
    maxCycleTime?: number;
    maxCycleNumber?: number;
    allowJIT?: boolean;
}