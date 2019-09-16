import { createStream } from "table";
import { Exporter } from "../exporter";
import { Suite } from "../../suite";
import { EventEmitter } from "events";
import { BenchmarkResult } from "../../benchmark";
import { TimeUnit } from "../../time";

export class ConsoleAsyncExporter extends Exporter {
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
	public onHierarchy(root: Suite[]): void { }
	public onFinished(): void { }
	private stream: { write: (msg: string[]) => void };

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
