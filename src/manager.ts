import Benchmark from "./benchmark";

interface BenchmarkData {
    name: string,
    benchmark: Benchmark,
    time?: number
}

export default class BenchmarkManager {

    private benchmarks: BenchmarkData[];

    constructor() {
        this.benchmarks = [];
    }

    public add(name: string, fn: () => void) {
        const b = new Benchmark(fn)
        this.benchmarks.push({ name: name, benchmark: b });

        return this;
    }

    public run() {
        this.printHeader();
        this.benchmarks.forEach((b) => {
            b.time = b.benchmark.run();
            this.printResults(b);
        })
        this.printBottom();
    }

    private printHeader() {
        const namePad = 12;
        const execTimePad = 1
        const headerText = `| ${"name".padEnd(namePad, " ")} | ${"execution time".padEnd(execTimePad, " ")} |`;
        const headerTopBar = `${"+".padEnd(headerText.length - 1, "-")}+`;
        const headerBottomBar = `${"+".padEnd(headerText.length - 1, "-")}+`
        console.log(headerTopBar);
        console.log(headerText);
        console.log(headerBottomBar);
    }

    private printBottom() {
        const namePad = 12;
        const execTimePad = 14
        const headerText = `${String.fromCharCode(186)} ${"name".padEnd(namePad, " ")} ${String.fromCharCode(186)} ${"execution time".padEnd(execTimePad, " ")} ${String.fromCharCode(186)}`;
        const bottomBar = `${"+".padEnd(headerText.length - 1, "-")}+`;
        console.log(bottomBar);
    }

    private printResults(b: BenchmarkData) {
        const namePad = 12;
        const execTimePad = 14
        console.log(`| ${b.name.padEnd(namePad, " ")} | ${(b.time.toFixed(2) + "ns").padEnd(execTimePad, " ")} |`);
    }
}