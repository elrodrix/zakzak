import Table from "cli-table";
import fs from "fs";
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
		const afterComma = parts[1];
		const availableLength = Math.max(0, maxLength - beforeComma.length);
		return `${beforeComma}${availableLength === 0 ? "" : "."}${afterComma.substring(0, availableLength)}${unit}`;
	}
}

export class JsonExporter {
	public write(benchmarks: Benchmark[]) {
		const text = JSON.stringify(benchmarks);
		const filename = `${new Date().toISOString()}.json`;
		fs.writeFileSync(filename, text, "utf8");
	}
}
