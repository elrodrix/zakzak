import Benchmark from "./benchmark";
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
    public add(name: string, fn: () => void) {
        const b = new Benchmark(name, fn)
        this.benchmarks.push(b);

        return this;
    }

    /**
     * Run all the benchmarks
     */
    public run() {
        let table = new Table({
            head: ["Name", "Execution time in ns", "Margin of Error"],
        });

        this.benchmarks.forEach((b) => {
            b.run();
            table.push(
                [b.name, b.executionTime, b.marginOfError]
            )
        })

        console.log(table.toString());
    }


}