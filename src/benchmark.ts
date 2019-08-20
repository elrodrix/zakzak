import process from "process";
import _ from "lodash";
import { TimeUnit } from "./time";
import { calculateMedian, calculateMarginOfError, calculateStandardError, getOptimizationStats, calculateMode, writeToJson, plotData } from "./util";
import v8natives from "v8-natives";

export default class Benchmark {

    private static idCounter = 0;

    public id: number;

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
     * Overhead for the measurement process
     */
    public overhead: number;

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
        this.id = Benchmark.idCounter++;

        const defaultOptions: BenchmarkOptions = {
            maxCycleTime: 500 * TimeUnit.Millisecond,
            maxCycleNumber: 100,
            allowJIT: true
        };
        this.options = _.merge(defaultOptions, opts)
        this.name = name;

        v8natives.deoptimizeNow();
        if (this.options.allowJIT === false) {
            const noOptim = () => { fn(); }
            v8natives.neverOptimizeFunction(noOptim);
            this.fn = noOptim;
        }
    }

    /**
     * Do a complete Benchmark run
     */
    public run() {
        // this.warmUpTest(this.fn)
        const warmupIter = this.estimateWarmup(this.fn);
        console.log(`warmupIter = ${warmupIter}`);
        this.overhead = this.measure(() => { }, warmupIter, 100);
        console.log(`overHead = ${this.overhead}`);
        const time = this.measure(this.fn, warmupIter, 100);
        console.log(`time = ${time}`);
        this.deductOverhead();
        return Math.max(time - this.overhead, 0); // incase overhead
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
            iterations = Math.ceil(iterations * 1.1);
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

        // plotData({ x: times.map(t => t.iter), y: times.map(t => t.time) });

        return best.iter;
    }

    private warmUpTest(fn: () => void) {
        const maxTime = 500 * TimeUnit.Millisecond;
        let times = []
        let stats = []
        const iter = 1000;
        const startTime = Benchmark.getTime()
        do {
            let temp = iter;
            stats.push(v8natives.getOptimizationStatus(fn))
            times.push(Benchmark.getTime())
            while (temp--) {
                fn()
            }
            times.push(Benchmark.getTime())

        } while (Benchmark.getTime() - startTime < maxTime)

        const actualTimes: number[] = [];
        for (let i = 0, l = times.length; i < l; i += 2) {
            actualTimes.push((times[i + 1] - times[i]) / iter);
        }
        const ignition: number[] = []
        const turbofannned: number[] = []
        stats = stats.map(v => getOptimizationStats(v).indexOf("TurboFanned") != -1)
        stats.forEach((v, i) => {
            if (v == true) {
                turbofannned.push(actualTimes[i])
            } else {
                ignition.push(actualTimes[i])
            }
        })

        const l = ignition.length
        plotData([
            { x: ignition.map((_, i) => i), y: ignition, color: "blue" },
            { x: turbofannned.map((_, i) => i + l), y: turbofannned, color: "red" }
        ]);
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

    private deductOverhead() {
        this.mean = Math.max(this.mean - this.overhead, 0);
        this.min = Math.max(this.min - this.overhead, 0);
        this.max = Math.max(this.max - this.overhead, 0);
        this.median = Math.max(this.median - this.overhead, 0);
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