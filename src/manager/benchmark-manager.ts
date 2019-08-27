// tslint:disable: no-var-requires
import _ from "lodash";
import Benchmark, { MeasurementResult } from "../benchmark/benchmark";
import Structure from "./structure";
import BenchmarkProcess from "./benchmark-process";
import OptionsManager from "../config/options-manager";
import { BenchmarkManagerOptions } from "../config/options";
import { ConsoleExporter, Exporter } from "./exporter";
import { TreeStructure } from "./tree-structure/tree-structure";


/**
 * Manages multiple benchmarks, their configuration, runtime seperation and exporting
 */
export default class BenchmarkManager {

	public results: MeasurementResult[] = [];

	constructor() {
		this.structureTreeRoot = [];
		this.options = OptionsManager.benchmarkManagerOptions;
		this.tree = new TreeStructure();
	}

	/**
	 * Add benchmark to list of found benchmarks
	 * @param benchmark found benchmark
	 */
	public addBenchmark(benchmark: Benchmark) {
		this.tree.addBenchmark(benchmark);
		return this;
	}

	/**
	 * Add structure to list of found structures
	 * @param structure found structure
	 */
	public addStructure(structure: Structure) {
		this.tree.addStructure(structure);
		return this;
	}

	/**
	 * Read all the files and extract the benchmarks
	 * @param files List of files containing benchmarks
	 */
	public readFiles(files: string[]) {
		files.forEach((file) => {
			this.tree.addFile(file);
		});

		return this;
	}

	public printTree() {
		this.tree.print();
	}

	/**
     * Run all the benchmarks and print them out
     */
	public run() {
		if (this.tree.benchmarks.length === 0) {
			return;
		}
		if (this.options.printTree === true) {
			this.printTree();
		}
		if (this.options.runParallel === true) {
			this.runAsync();
		} else {
			this.runSync();
		}
	}

	public findBenchmark(b: Benchmark) {
		return this.tree.findBenchmark(b);
	}

	public addExporter(...arg: Exporter[]) {
		this.exporters.push(...arg);
		return this;
	}

	/**
	 * Get the singleton instance of the benchmark manager
	 */
	public static getInstance() {
		if (BenchmarkManager.instance == null) {
			BenchmarkManager.instance = new BenchmarkManager();
		}

		return BenchmarkManager.instance;
	}

	/**
	 * Singleton instance of the benchmark manager
	 */
	private static instance: BenchmarkManager;

	/**
	 * List containing the root nodes of the structures, which are the files in which the statements are found
	 */
	private structureTreeRoot: Structure[];

	/**
	 * Options for the benchmark manager
	 */
	private options: BenchmarkManagerOptions;

	/**
	 * Keeps track of the relationships and structure of the benchmarks
	 */
	private tree: TreeStructure;

	/**
	 * List of exporters applied to results
	 */
	private exporters: Exporter[] = [];

	private runAsync() {
		const promises: Array<Promise<Benchmark>> = [];
		const processes: BenchmarkProcess[] = [];

		this.tree.benchmarks.forEach((benchmark) => {
			const p = new BenchmarkProcess(benchmark);
			processes.push(p);
			promises.push(p.run());
		});

		Promise.all(promises).then((benchmarks) => {
			this.exporters.forEach((e) => e.write(benchmarks));
		});
	}

	/**
	 * Runs the benchmarks in a synchronous fashion
	 */
	private runSync() {
		const processes: BenchmarkProcess[] = [];
		this.tree.benchmarks.forEach((benchmark) => {
			const p = new BenchmarkProcess(benchmark);
			processes.push(p);
		});

		let runningBenchmark = _.first(processes)
			.run()
			.then((b) => {
				return [b];
			});

		processes.forEach((p) => {
			runningBenchmark = runningBenchmark.then((benchmarks) => {
				return p.run().then((b) => {
					benchmarks.push(b);
					return benchmarks;
				});
			});
		});

		runningBenchmark.then((benchmarks) => {
			this.exporters.forEach((e) => e.write(benchmarks));
		}).catch((err) => {
			console.error(`\nError in benchmarks: ${JSON.stringify(err)}\n`);
		});
	}
}
