import Benchmark, { BenchmarkOptions } from "../benchmark/benchmark";
import Table from "cli-table";

interface BenchmarkData {
    name: string,
    benchmark: Benchmark
}

export default class BenchmarkManager {

    private benchmarks: Benchmark[];

    constructor() {
        this.benchmarks = [];
    }

    /**
     * Add a function that will be benchmarked
     * @param name Name of the function for display purposes
     * @param fn The function that will be benchmarked
     */
    public add(name: string, fn: () => void, options?: BenchmarkOptions) {
        const b = new Benchmark(name, fn, options)
        this.benchmarks.push(b);

        return this;
    }

    /**
     * Run all the benchmarks and print them out
     */
    public run() {
        let table = new Table({
            head: ["Name", "Execution time", "Margin of Error", "Standard Error", "Min", "Max", "Median"],
        });

        this.benchmarks.forEach((b) => {
            b.run();
            table.push(
                [b.name, b.mean.toFixed(3), b.marginOfError.toFixed(3), b.standardError.toFixed(3), b.min.toFixed(3), b.max.toFixed(3), b.median.toFixed(3)]
            )
        })

        console.log(table.toString());
    }
}