import { Benchmark, BenchmarkResult } from "@zakzak/benchmark/benchmark";
import BenchmarkProcess from "@zakzak/manager/benchmark-process";
import OptionsManager from "@zakzak/config/options-manager";
import "@zakzak/logging";


/**
 * Manages multiple benchmarks, their configuration, runtime seperation and exporting
 */
export default class BenchmarkManager {

	constructor(public benchmarks: Benchmark[], public options = OptionsManager.benchmarkManagerOptions) { }

	/**
     * Run all the benchmarks and print them out
     */
	public run() {
		if (this.options.runParallel === true) {
			this.runParallel();
		} else {
			this.runSync();
		}
	}

	private runParallel() {
		const promises: Array<Promise<Benchmark>> = [];
		const processes: BenchmarkProcess[] = [];

		this.benchmarks.forEach((benchmark) => {
			const p = new BenchmarkProcess(benchmark);
			processes.push(p);
			promises.push(p.run());
		});

		Promise.all(promises).then((benchmarks) => {
			zak.results(benchmarks);
		});
	}

	/**
	 * Runs the benchmarks in a synchronous fashion
	 */
	private runSync() {
		const processes = this.benchmarks.map((b) => new BenchmarkProcess(b));

		const benchmarkSequence = async () => {
			const results: BenchmarkResult[] = [];
			for (const p of processes) {
				const result: BenchmarkResult = await p.run();
				results.push(result);
			}
			return results;
		};

		benchmarkSequence().then((results) => {
			zak.results(results);
		}).catch((err) => {
			zak.info(`\nError in benchmarks: ${JSON.stringify(err)}\n`);
		});
	}
}
