import path from "path";
import fs from "fs";
import { BenchmarkManagerOptions } from "@zakzak/config/options";
import { Exporter, ConsoleExporter, JsonExporter, CsvExporter, XmlExporter } from "./exporter";
import { BenchmarkResult } from "@zakzak/benchmark/benchmark";

export class ExportManager {
	constructor(private options: BenchmarkManagerOptions) {
		this.exporters = this.getExporters();
	}

	public write(results: BenchmarkResult[]) {
		this.exporters.forEach((e) => e.exportResults(results));
	}
	private exporters: Exporter[];

	private getExporters() {
		return this.options.exporter.map((e) => this.getExporter(e));
	}

	private getExporter(exporterString: string) {
		let exporter: Exporter;
		if (exporterString !== "" && this.options.exporter != null) {
			switch (exporterString) {
				case "console":
					exporter = new ConsoleExporter();
					break;
				case "json":
					exporter = new JsonExporter();
					break;
				case "csv":
					exporter = new CsvExporter();
					break;
				case "xml":
					exporter = new XmlExporter();
					break;
				default:
					const filepath = path.resolve(path.posix.join(process.cwd(), exporterString));
					if (fs.existsSync(filepath)) {
						exporter = this.requireExporter(filepath);
					}
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
