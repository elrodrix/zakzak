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

import { createStream } from "table";
import { EventEmitter } from "events";

import { BenchmarkResult } from "../../benchmark";
import { Exporter } from "../exporter";
import { TimeUnit } from "../../time";

/**
 * Exports live results to the console, showing a result as soon as a benchmark is done.
 */
export class ConsoleAsyncExporter extends Exporter {
	/**
	 * Creates new exporter, writes the header of the table
	 * to the console and creates the stream writer that will update when new results come in
	 */
	constructor(em: EventEmitter) {
		super(em);
		const header = ["Name", "Measurements", "Cycles", "Mean", "Median", "Mode", "StdDev", "StdErr", "MoE", "Min", "Max"];
		const config = {
			columnDefault: {
				width: 15
			},
			columnCount: header.length
		};

		// @types/table has wrong/old typedefs for createStream.
		this.stream = createStream(config) as unknown as { write: (msg: string[]) => void };

		this.stream.write(header);
	}
	public onResult(result: BenchmarkResult): void {
		this.stream.write([
			result.name,
			String(result.times.length),
			String(result.count),
			this.nsToPrettyString(result.stats.mean),
			this.nsToPrettyString(result.stats.median),
			this.nsToPrettyString(result.stats.mode),
			this.nsToPrettyString(result.stats.standardDeviation),
			this.nsToPrettyString(result.stats.standardError),
			this.nsToPrettyString(result.stats.marginOfError),
			this.nsToPrettyString(result.stats.min),
			this.nsToPrettyString(result.stats.max)
		]);
	}
	public onFinished(): void {
		console.log();
	}
	private stream: { write: (msg: string[]) => void };

	/**
	 * Converts nanosecond times to a more readable format.
	 * Always 3 digit long, excluding the coma/dot.
	 */
	private nsToPrettyString(time: number) {
		let unit = "ns";
		let convertedTime = time;
		if (time >= TimeUnit.Second) {
			unit = "s";
			convertedTime = time / TimeUnit.Second;
		} else if (time >= TimeUnit.Millisecond) {
			unit = "ms";
			convertedTime = time / TimeUnit.Millisecond;
		} else if (time >= TimeUnit.Microsecond) {
			unit = "µs";
			convertedTime = time / TimeUnit.Microsecond;
		}

		const maxLength = 3;
		const timeString = convertedTime.toString();
		const parts = timeString.split(".");
		const beforeComma = parts[0];
		const afterComma = parts[1] !== undefined ? parts[1] : "";
		const availableLength = Math.max(0, maxLength - beforeComma.length);
		return `${beforeComma}${availableLength === 0 ? "" : "."}${afterComma.substring(0, availableLength)}${unit}`;
	}
}
