import process from "process";
import _ from "lodash";
import { TimeUnit } from "./time";
import { median } from "./util";

export default class Benchmark {

    public constructor(private fn: () => void, private name: string) { }

    public run() {
        const warmupIter = this.estimateWarmup(this.fn);
        const overHead = this.measure(() => { }, warmupIter, 100);
        const time = this.measure(this.fn, warmupIter, 100);
        return time - overHead;
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

        return _.mean(actualTimes);
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