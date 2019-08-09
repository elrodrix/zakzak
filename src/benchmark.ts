import process from "process";
import * as chartist from "node-chartist";

export default class Benchmark {
    public constructor(private fn: () => void, private name: string) { }

    public run() {
        this.warmup(this.fn);
    }

    private warmup(fn: () => void) {
        const times: number[] = []

        for (let i = 0; i < 20; i++) {
            times.push(this.measureFunction(fn))
        }

        
    }

    /**
     * Measure duration of function execution in nanoseconds
     * @param fn Function to be measured
     */
    private measureFunction(fn: () => void) {
        const startTime = Benchmark.getTime();
        fn();
        const endTime = Benchmark.getTime();
        return endTime - startTime;
    }

    /**
     * Returns time in nanoseconds
     */
    private static getTime(): number {
        const time = process.hrtime();
        return time[0] * 1e9 + time[1];
    }
}