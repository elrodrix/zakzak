import path from "path";
import fs from "fs";

import { BenchmarkManagerOptions } from "../config";
import { BenchmarkResult } from "../benchmark";
import { ConsoleExporter, JsonExporter, CsvExporter, XmlExporter, ConsoleAsyncExporter } from "./default";
import { Exporter, ExporterEvents } from "./exporter";
import { EventEmitter } from "events";
import { Suite } from "../suite";

export class ExportManager {
	constructor(private options: BenchmarkManagerOptions) {
		this.em = new EventEmitter();
		this.exporters = this.getExporters();
	}

	public exportHierarchy(root: Suite[]) {
		this.em.emit(ExporterEvents.Hierarchy, root);
	}

	public exportResult(result: BenchmarkResult) {
		this.em.emit(ExporterEvents.Result, result);
	}

	public exportFinished(results: BenchmarkResult[]) {
		this.em.emit(ExporterEvents.Finished, results);
	}

	private exporters: Exporter[];
	private em: EventEmitter;

	private getExporters() {
		return this.options.exporter.map((e) => this.getExporter(e)).filter((e) => e != null);
	}

	private getExporter(exporterString: string) {
		let exporter: Exporter;
		if (exporterString !== "") {
			switch (exporterString) {
				case "console":
					exporter = new ConsoleExporter(this.em);
					break;
				case "console-async":
					exporter = new ConsoleAsyncExporter(this.em);
					break;
				case "json":
					exporter = new JsonExporter(this.em);
					break;
				case "csv":
					exporter = new CsvExporter(this.em);
					break;
				case "xml":
					exporter = new XmlExporter(this.em);
					break;
				default:
					const filepath = path.resolve(path.posix.join(process.cwd(), exporterString));
					if (fs.existsSync(filepath)) {
						exporter = this.requireExporter(filepath);
					}
					break;
			}
		}

		return exporter;
	}

	private requireExporter(filepath: string): Exporter {
		const exports = require(filepath);
		const exported: new (em: EventEmitter) => Exporter = Object.keys(exports).map((v) => exports[v])[0];
		const exporter = new (exported)(this.em);
		return exporter;
	}


}
