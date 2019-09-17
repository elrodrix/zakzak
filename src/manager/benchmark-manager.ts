import _ from "lodash";

import { Benchmark, BenchmarkProcess, ExitMessage } from "../benchmark";
import { BenchmarkManagerOptions } from "../config";
import { ExportManager } from "../exporter";


/**
 * Manages multiple benchmarks, their configuration, runtime seperation and exporting
 */
export class BenchmarkManager {
	constructor(public benchmarks: Benchmark[], public options: BenchmarkManagerOptions, private exporter: ExportManager) {
	}

	/**
     * Run all the benchmarks and print them out
     */
	public async run() {
		let messages: ExitMessage[] = [];
		messages = await this.runParallel();
		messages.filter((m) => m.error != null).forEach((m) => {
			throw m.error;
		});
		const results = messages.filter((m) => m.result !== null).map((m) => m.result);
		this.exporter.exportFinished(results);
		return results;
	}

	private getProcesses(): BenchmarkProcess[] {
		return this.benchmarks.map((b) => new BenchmarkProcess(b.id, b.filepath, b.options));
	}

	private runParallel() {
		const processes = this.getProcesses();

		const groups = _.chunk(processes, Math.max(1, this.options.runParallel));

		const benchmarkSequence = async () => {
			const results: ExitMessage[] = [];
			for (const g of groups) {
				const msgs = await Promise.all(g.map((p) => p.run()));
				msgs.forEach((msg) => {
					if (msg.result) {
						this.exporter.exportResult(msg.result);
					}
				});
				results.push(...msgs);
			}
			return results;
		};

		return benchmarkSequence();
	}
}
