import { createObjectCsvWriter } from "csv-writer";
import { Exporter } from "../exporter";
import { Suite } from "../../suite";
import { BenchmarkResult } from "../../benchmark";

export class CsvExporter extends Exporter {
	public onHierarchy(root: Suite[]): void { }
	public onResult(result: BenchmarkResult): void { }
	public onFinished(results: BenchmarkResult[]): void {
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

