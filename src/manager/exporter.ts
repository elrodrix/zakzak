import Table from "cli-table";
import Benchmark from "./../benchmark/benchmark";
import { TimeUnit } from "./../benchmark/time";
import { stringify } from "querystring";

export abstract class Exporter {
	public abstract write(benchmarks: Benchmark[]): void;
}

export class ConsoleExporter extends Exporter {
	public write(benchmarks: Benchmark[]) {
		if (benchmarks.length === 0) {
			console.log("no benchmarks found");
			return;
		}

		const table = new Table({
			head: ["Name", "Execution time", "Margin of Error", "Standard Error", "Min", "Max", "Median"]
		});

		benchmarks.forEach((b) => {
			table.push(
				[
					b.name,
					this.nsToPrettyString(b.mean),
					this.nsToPrettyString(b.marginOfError),
					this.nsToPrettyString(b.standardError),
					this.nsToPrettyString(b.min),
					this.nsToPrettyString(b.max),
					this.nsToPrettyString(b.median)
				]
			);
		});

		console.log(table.toString());
	}

	private nsToPrettyString(time: number) {
		let unit = "";
		if (time > TimeUnit.Second * 100) {
			time /= TimeUnit.Second;
			unit = "s";
		} else if (time > TimeUnit.Millisecond * 100) {
			time /= TimeUnit.Millisecond;
			unit = "ms";
		} else if (time > TimeUnit.Microsecond * 100) {
			time /= TimeUnit.Microsecond;
			unit = "µs";
		} else if (time > TimeUnit.Nanosecond * 100) {
			time /= TimeUnit.Nanosecond;
			unit = "ns";
		}

		const availableLength = 7;
		const parts = time.toString().split(".");
		const beforeComma = parts[0];
		const afterComma = parts.length <= 1 ? "" : parts[1].substr(0, Math.max(0, availableLength - beforeComma.length));

		return `${beforeComma}.${afterComma}${unit}`;
	}
}
