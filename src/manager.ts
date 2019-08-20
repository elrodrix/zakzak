import Benchmark, { BenchmarkOptions } from "./benchmark";
import Table from "cli-table";
import { startChildProcess } from "./parent";

interface BenchmarkData {
    name: string,
    benchmark: Benchmark
}

export default class BenchmarkManager {

    private benchmarks: Benchmark[];

    private isMasterProcess: boolean;

    constructor(private entryFileName: string) {
        this.benchmarks = [];

        this.isMasterProcess = false;
        if (process.send === undefined) { // Master process has no send
            this.isMasterProcess = true;
        }
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

        if (this.isMasterProcess) {

            this.benchmarks.forEach((b) => {
                startChildProcess(this.entryFileName, [String(b.id)],{})
                b.run();
                table.push(
                    [b.name, b.mean.toFixed(3), b.marginOfError.toFixed(3), b.standardError.toFixed(3), b.min.toFixed(3), b.max.toFixed(3), b.median.toFixed(3)]
                )
            })
        }



        console.log(table.toString());
    }


}