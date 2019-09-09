import path from "path";
import { CLIOptions } from "@zakzak/config/options";
import { Exporter } from "./exporter";
import { BenchmarkResult } from "@zakzak/benchmark/benchmark";

export class ExportManager {
	constructor(private options: CLIOptions) {
		this.exporter = this.getExporter();
	}

	public write(results: BenchmarkResult[]) {
		this.exporter.exportResults(results);
	}
	private exporter: Exporter;

	private getExporter() {
		let exporter: Exporter;
		if (this.options.exporter !== "" && this.options.exporter != null) {
			switch (this.options.exporter) {
				case "console":
					break;
				case "json":
					break;
				case "csv":
					break;
				case "xml":
					break;
				default:
					const filepath = this.options.exporter;
					exporter = this.requireExporter(filepath);
					break;
			}
		}

		if (exporter == null) {
			exporter = { exportResults: (foo: any) => { } };
		}

		return exporter;
	}

	private requireExporter(filepath: string): Exporter {
		const exports = require(filepath);
		const exported: FunctionConstructor = Object.keys(exports).map((v) => exports[v])[0];
		const exporter = new (exported)() as unknown as Exporter;
		return exporter;
	}


}
