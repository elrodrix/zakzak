import fs from "fs";
import Table from "cli-table";
import { js2xml } from "xml-js";
import { BenchmarkResult } from "@zakzak/benchmark/benchmark";
import { TimeUnit } from "@timeunit";
import { createObjectCsvWriter } from "csv-writer";


export abstract class Exporter {
	public abstract exportResults(results: BenchmarkResult[]): void;
}

export class ConsoleExporter implements Exporter {
	public exportResults(results: BenchmarkResult[]): void {
		const table = new Table({
			head: ["Name", "Measurements", "Cycles", "Mean", "Median", "Mode", "StdDev", "StdErr", "MoE", "Min", "Max"]
		});

		results.forEach((r) => {
			table.push(
				[
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
		const afterComma = parts[1] !== undefined ? parts[1] : "";
		const availableLength = Math.max(0, maxLength - beforeComma.length);
		return `${beforeComma}${availableLength === 0 ? "" : "."}${afterComma.substring(0, availableLength)}${unit}`;
	}
}

export class JsonExporter implements Exporter {
	public exportResults(results: BenchmarkResult[]): void {
		const data = JSON.stringify(results);
		fs.writeFileSync(`${new Date().toISOString()}.data.json`, data);
	}
}

export class CsvExporter implements Exporter {
	public exportResults(results: BenchmarkResult[]): void {
		const csvWriter = createObjectCsvWriter({
			path: `${new Date().toISOString()}.data.csv`,
			header: [
				{ id: "name", title: "Name" },
				{ id: "file", title: "File" },
				{ id: "measurements", title: "Measurements" },
				{ id: "cycles", title: "Cycles" },
				{ id: "mean", title: "Mean" },
				{ id: "median", title: "Median" },
				{ id: "mode", title: "Mode" },
				{ id: "stddev", title: "StdandardDeviation" },
				{ id: "stderr", title: "StdandardError" },
				{ id: "moe", title: "MarginOfError" },
				{ id: "min", title: "Min" },
				{ id: "max", title: "Max" }
			]
		});

		const records = results.map((r) => {
			return {
				name: r.name,
				file: r.filename,
				measurements: r.times,
				cycles: r.count,
				mean: r.stats.mean,
				median: r.stats.median,
				mode: r.stats.mode,
				stddev: r.stats.standardDeviation,
				stderr: r.stats.standardError,
				moe: r.stats.marginOfError,
				min: r.stats.min,
				max: r.stats.max
			};
		});

		csvWriter.writeRecords(records);
	}

}

export class XmlExporter implements Exporter {
	public exportResults(results: BenchmarkResult[]): void {
		// Dont remove compact statement
		// https://github.com/nashwaan/xml-js/issues/60
		const xmlString = js2xml(results, { compact: true });
		fs.writeFileSync(`${new Date().toISOString()}.data.xml`, xmlString);
	}
}
