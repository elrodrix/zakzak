import { Benchmark, BenchmarkResult } from "@zakzak/benchmark/benchmark";
import { BenchmarkProcess } from "@zakzak/manager/benchmark-process";
import { BenchmarkManagerOptions } from "@zakzak/config/options";
import { ExitMessage } from "./child-process";


/**
 * Manages multiple benchmarks, their configuration, runtime seperation and exporting
 */
export class BenchmarkManager {

	constructor(public benchmarks: Benchmark[], public options: BenchmarkManagerOptions) { }

	/**
     * Run all the benchmarks and print them out
     */
	public async run() {
		let messages: ExitMessage[] = [];
		if (this.options.runParallel === true) {
			messages = await this.runParallel();
		} else {
			messages = await this.runSync();
		}
		messages.filter((m) => m.error !== null).forEach((m) => { throw m.error; });
		const results = messages.filter((m) => m.result !== null).map((m) => m.result);
		return results;
	}

	private getProcesses(): BenchmarkProcess[] {
		return this.benchmarks.map((b) => new BenchmarkProcess(b.id, b.filename, b.options));
	}

	private runParallel() {
		const processes = this.getProcesses();
		const promises = processes.map((p) => p.run());

		return Promise.all(promises);
	}

	/**
	 * Runs the benchmarks in a synchronous fashion
	 */
	private runSync() {
		const processes = this.getProcesses();

		const benchmarkSequence = async () => {
			const results: ExitMessage[] = [];
			for (const p of processes) {
				const msg = await p.run();
				results.push(msg);
			}
			return results;
		};

		return benchmarkSequence();
	}
}
