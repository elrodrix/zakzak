import process from "process";
import _ from "lodash";
import { TimeUnit } from "./time";
import { median } from "./util";

export default class Benchmark {
    public constructor(private fn: () => void, private name: string) { }

    public run() {
        // const cycleTime = this.getCycleTime(this.fn, { warmupIterations: 200, targetIterations: 30 });
        const functionIterationCount = this.getFunctionIterationCount(this.fn);
        console.log(`innerIterationCount: ${functionIterationCount}`);
        const overHead = this.measure(() => { }, { cycleTime: 64 * TimeUnit.Millisecond, warmupIterations: 200, cycles: 100, functionIterationCount: functionIterationCount })
        console.log(`overhead: ${overHead}`);
        const time = this.measure(this.fn, { cycleTime: 64 * TimeUnit.Millisecond, warmupIterations: 200, cycles: 100, functionIterationCount: functionIterationCount })
        console.log(`time: ${time}`);
        return time - overHead;
    }

    private getFunctionIterationCount(fn: () => void, options = { warmupIterations: 100, minTime: 50 * TimeUnit.Microsecond, sampleCount: 20 }) {
        // warm up the function
        for (let i = 0; i < options.warmupIterations; i++) {
            fn();
        }

        let iterations = [];
        for (let i = 0; i < options.sampleCount; i++) {
            let count = 0;
            const startTime = Benchmark.getTime();
            do {
                fn();
                count++;
            } while (Benchmark.getTime() - startTime < options.minTime)
            iterations.push(count);
        }

        // To prevent returning 0 if function consistently takes longer than minTime
        return Math.max(1, _.mean(iterations))
    }

    private measure(fn: () => void, options = { warmupIterations: 100, cycleTime: 32 * TimeUnit.Millisecond, cycles: 30, functionIterationCount: 1 }) {
        for (let i = 0; i < options.warmupIterations; i++) {
            fn();
        }

        const measurements: number[][] = [];

        let times: number[] = [];

        for (let i = 0; i < options.cycles; i++) {
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