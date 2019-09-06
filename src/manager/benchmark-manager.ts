import { Benchmark, BenchmarkResult } from "@zakzak/benchmark/benchmark";
import { BenchmarkProcess } from "@zakzak/manager/benchmark-process";
import { BenchmarkManagerOptions } from "@zakzak/config/options";


/**
 * Manages multiple benchmarks, their configuration, runtime seperation and exporting
 */
export class BenchmarkManager {

	constructor(public benchmarks: Benchmark[], public options: BenchmarkManagerOptions) { }

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

	private getProcesses(): BenchmarkProcess[] {
		return this.benchmarks.map((b) => new BenchmarkProcess(b.id, b.filename, b.options));
	}

	private runParallel() {
		const processes = this.getProcesses();
		const promises = processes.map((p) => p.run());

		Promise.all(promises).then((benchmarks) => {

		}).catch((err) => {

		});
	}

	/**
	 * Runs the benchmarks in a synchronous fashion
	 */
	private runSync() {
		const processes = this.getProcesses();

		const benchmarkSequence = async () => {
			const results: BenchmarkResult[] = [];
			for (const p of processes) {
				const msg = await p.run();
				if (msg.result) {
					results.push(msg.result);
					console.log(`${msg.result.name}: ${msg.result.stats.mean}`);
				}
			}
			return results;
		};

		benchmarkSequence().then((results) => {
			results.forEach((r) => {
				// console.log(`${r.name}: ${r.stats.mean}`);
			});
		}).catch((err) => {
			console.error(err);
		});
	}
}
