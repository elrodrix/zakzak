import process from "process";
import _ from "lodash";
import { TimeUnit } from "./time";
import { median } from "./util";

export default class Benchmark {

    public constructor(private fn: () => void, private name: string) { }

    public run() {
        const warmupIter = this.estimateWarmup(this.fn);
        const functionIterationCount = this.getFunctionIterationCount(this.fn, warmupIter);
        console.log(`innerIterationCount: ${functionIterationCount}`);
        const overHead = this.measure(() => { }, { cycleTime: 64 * TimeUnit.Millisecond, warmupIterations: warmupIter, cycles: 100, functionIterationCount: functionIterationCount })
        console.log(`overhead: ${overHead}`);
        const time = this.measure(this.fn, { cycleTime: 64 * TimeUnit.Millisecond, warmupIterations: warmupIter, cycles: 100, functionIterationCount: functionIterationCount })
        console.log(`time: ${time}`);
        return time - overHead;
    }

    /**
     * Estimates how often the function has the be executed in order to be properly warmed up
     * @param fn 
     */
    private estimateWarmup(fn: () => void, maxTime = 2 * TimeUnit.Second) {
        let iterations = 1
        let total = 0;
        let times: { time: number, iter: number }[] = [];
        console.log("\nestimating warmup\n");
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
            console.log(`time: ${currentTime} iter: ${iterations}`)
        } while (total < maxTime)
        const min = _.minBy(times, t => t.time);
        const best = _.minBy(_.filter(times, t => t.time / min.time < 1.1), t => t.iter);

        console.log(`\npicked warmup iteration count: ${best.iter}\n`)

        return best.iter;
    }

    /**
     * Calculates how often the inner loop wrapping the function should run
     * @param fn 
     * @param warmupIterations 
     * @param options 
     */
    private getFunctionIterationCount(fn: () => void, warmupIterations = 100, options = { minTime: 50 * TimeUnit.Microsecond, sampleCount: 20 }) {
        let iterations = [];

        for (let i = 0; i < options.sampleCount; i++) {
            let count = 0;
            for (let i = 0; i < warmupIterations; i++) {
                fn();
            }
            const startTime = Benchmark.getTime();
            do {
                fn();
                count++;
            } while (Benchmark.getTime() - startTime < options.minTime)
            iterations.push(count);
        }

        // To prevent returning 0 if function consistently takes longer than minTime
        return Math.round(Math.max(1, _.mean(iterations)))
    }

    private measure(fn: () => void, options = { warmupIterations: 100, cycleTime: 32 * TimeUnit.Millisecond, cycles: 30, functionIterationCount: 1 }) {
        const measurements: number[][] = [];
        let times: number[] = [];

        for (let i = 0; i < options.cycles; i++) {
            for (let x = 0; x < options.warmupIterations; x++) {
                fn();
            }
            const cycleStartTime = Benchmark.getTime();
            do {
                const startTime = Benchmark.getTime()
                for (let x = 0; x < options.functionIterationCount; x++) {
                    fn();
                }
                const endTime = Benchmark.getTime();
                times.push((endTime - startTime) / options.functionIterationCount);
            } while (Benchmark.getTime() - cycleStartTime < options.cycleTime)
            measurements.push(times);
            times = [];
        }

        times = measurements.map((m) => {
            return median(m);
        })

        return _.mean(times);
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