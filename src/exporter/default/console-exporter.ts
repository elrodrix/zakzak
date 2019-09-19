import { table } from "table";
import { Exporter } from "../exporter";
import { BenchmarkResult } from "../../benchmark";
import { TimeUnit } from "../../time";
import { Suite } from "../../suite";

/**
 * Exports results to the console once all benchmarks are done
 */
export class ConsoleExporter extends Exporter {
	public onHierarchy(root: Suite[]): void { }
	public onResult(result: BenchmarkResult): void { }
	public onFinished(results: BenchmarkResult[]): void {
		const header = ["Name", "Measurements", "Cycles", "Mean", "Median", "Mode", "StdDev", "StdErr", "MoE", "Min", "Max"];
		const data = results.map((r) => [
			r.name,
			r.times.length,
			r.count,
			this.nsToPrettyString(r.stats.mean),
			this.nsToPrettyString(r.stats.median),
			this.nsToPrettyString(r.stats.mode),
			this.nsToPrettyString(r.stats.standardDeviation),
			this.nsToPrettyString(r.stats.standardError),
			this.nsToPrettyString(r.stats.marginOfError),
			this.nsToPrettyString(r.stats.min),
			this.nsToPrettyString(r.stats.max)
		]);

		const output = table([header, ...data]);

		console.log(output);
	}

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
