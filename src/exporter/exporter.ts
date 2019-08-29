import Table from "cli-table";
import { EventEmitter } from "events";
import Benchmark from "@zakzak/benchmark/benchmark";
import TimeUnit from "@timeunit";
import Structure from "@zakzak/manager/structure";
import { OptionsWrapper } from "@zakzak/config/options";
import { ExportEmitter, EVENT_RESULTS, EVENT_TREE, EVENT_LOG, EVENT_INFO, EVENT_DEBUG } from "@zakzak/exporter/emitter";

export class ExporterRepository {
	public static addExporter(exporter: Exporter) {
		ExporterRepository.exporters.push(exporter);
	}
	public static addFromFile(filename: string) {
		const em = ExportEmitter.getInstance();
		const exports = require(filename);
		const exporters = Object.keys(exports).filter((v) => new exports[v](new EventEmitter()) instanceof Exporter);
		ExporterRepository.exporters.push(...(exporters.map((v) => new exports[v](em))));
	}
	private static exporters: Exporter[] = [];
}

export class Exporter {
	// tslint:disable-next-line: no-empty
	constructor(emitter: ExportEmitter) { }
}

export class ConsoleExporter extends Exporter {
	constructor(private emitter: ExportEmitter, private options: OptionsWrapper) {
		super(emitter);
		emitter.on(EVENT_RESULTS, (args) => {
			this.writeBenchmarkResults(args);
		});

		if (this.options.manager.printTree) {
			emitter.on(EVENT_TREE, (args) => {
				this.printTree(args);
			});
		}

		if (this.options.cli.quiet === false) {
			emitter.on(EVENT_LOG, (...args: any[]) => {
				console.log(...args);
			});
		}

		if (this.options.cli.quiet === false) {
			emitter.on(EVENT_INFO, (...args: any[]) => {
				console.log(`${new Date().toISOString()}:`, ...args);
			});
		}

		if (this.options.cli.quiet === false) {
			if (this.options.cli.verbose === true) {
				emitter.on(EVENT_DEBUG, (...args: any[]) => {
					console.log(`${new Date().toISOString()}:`, ...args);
				});
			}
		}

	}

	private writeBenchmarkResults(benchmarks: Benchmark[]) {
		if (benchmarks.length === 0) {
			console.log("no benchmarks found");
			return;
		}

		const table = new Table({
			head: ["Name", "Execution time", "Margin of Error", "Standard Error", "Min", "Max", "Median", "Overhead", "Warmup", "Total"]
		});

		benchmarks.forEach((b) => {
			table.push(
				[
					b.name,
					this.nsToPrettyString(b.results.mean),
					this.nsToPrettyString(b.results.marginOfError),
					this.nsToPrettyString(b.results.standardError),
					this.nsToPrettyString(b.results.min),
					this.nsToPrettyString(b.results.max),
					this.nsToPrettyString(b.results.median),
					this.nsToPrettyString(b.overhead),
					b.warmup,
					this.nsToPrettyString(b.endTime - b.startTime)
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

	/**
	 * Print out the currently discovered structure tree to the console
	 */
	private printTree(files: Structure[]) {
		files.forEach((file) => {
			console.log(`file: ${file.filename}`);
			file.children.forEach((child) => {
				this.printNode(child, 1);
			});
		});
	}

	/**
	 * Print a node and all its children recursively to the console
	 * @param node Current node from which we will traverse downwards
	 * @param layer Current layer in which the node is
	 */
	private printNode(node: Benchmark | Structure, layer: number) {
		console.log(`${"".padStart(layer, "-")}${node.name}`);
		if (node instanceof Structure) {
			node.children.forEach((child) => {
				this.printNode(child, layer + 1);
			});
		}
	}
}