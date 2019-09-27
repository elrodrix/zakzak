/*!
 * Copyright 2019, Dynatrace LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import _ from "lodash";

import { Benchmark, BenchmarkProcess, ExitMessage } from "../benchmark";
import { BenchmarkManagerOptions } from "../config";
import { ExportManager } from "../exporter";


/**
 * Manages multiple benchmarks, their configuration, runtime seperation and exporting
 */
export class BenchmarkManager {
	constructor(public benchmarks: Benchmark[], public options: BenchmarkManagerOptions, private exporter: ExportManager) { }

	/**
     * Run all the benchmarks and export them
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

	/**
	 * Get Benchmarkprocesses for all the benchmarks
	 */
	private getProcesses(): BenchmarkProcess[] {
		return this.benchmarks.map((b) => new BenchmarkProcess(b.id, b.filepath, b.options));
	}

	/**
	 * Runs all the benchmarks.
	 * Groups multiple benchmarks together, as specified in `options.runparallel`.
	 * Runs all benchmarks in a group in parallel.
	 * Runs the groups in series
	 */
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
