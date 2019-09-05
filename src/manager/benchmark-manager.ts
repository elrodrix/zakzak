// tslint:disable: no-var-requires
import _ from "lodash";
import Benchmark from "@zakzak/benchmark/benchmark";
import Structure from "structure/structure";
import BenchmarkProcess from "@zakzak/manager/benchmark-process";
import OptionsManager from "@zakzak/config/options-manager";
import { BenchmarkManagerOptions, BenchmarkOptions } from "@zakzak/config/options";
import { TreeStructure } from "structure/structure-manager";
import "@zakzak/logging";


/**
 * Manages multiple benchmarks, their configuration, runtime seperation and exporting
 */
export default class BenchmarkManager {
	constructor() {
	}

	/**
	 * Add benchmark to list of found benchmarks
	 * @param benchmark found benchmark
	 */
	public addBenchmark(name: string, fn: Function, options = OptionsManager.benchmarkOptions) {
		this.tree.addBenchmark(name, fn, options);
		return this;
	}

	/**
	 * Add structure to list of found structures
	 * @param structure found structure
	 */
	public addStructure(name: string, fn: Function, options = OptionsManager.benchmarkOptions) {
		this.tree.addStructure(name, fn , options);
		return this;
	}

	/**
	 * Read all the files and extract the benchmarks
	 * @param files List of files containing benchmarks
	 */
	public readFiles(files: string[]) {
		zak.debug("reading files into manager");
		files.forEach((file) => {
			this.tree.addFile(file);
		});

		return this;
	}

	public printTree() {
		zak.tree(this.tree.files);
		return this;
	}

	/**
     * Run all the benchmarks and print them out
     */
	public run() {
		zak.debug("running benchmarks from manager now");
		if (this.tree.benchmarks.length === 0) {
			zak.info("no benchmarks found");
			return;
		}
		if (this.options.printTree === true) {
			zak.debug("printing structure tree");
			this.printTree();
		}
		if (this.options.runParallel === true) {
			this.runParallel();
		} else {
			this.runSync();
		}
	}

	public findBenchmark(b: Benchmark) {
		return this.tree.findBenchmark(b);
	}

	/**
	 * Get the singleton instance of the benchmark manager
	 */
	public static getInstance() {
		if (BenchmarkManager.instance == null) {
			zak.debug("creating new benchmarkmanager instance");
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

	private runParallel() {
		zak.debug("running benchmarks in parallel mode");
		const promises: Array<Promise<Benchmark>> = [];
		const processes: BenchmarkProcess[] = [];

		this.tree.benchmarks.forEach((benchmark) => {
			const p = new BenchmarkProcess(benchmark);
			processes.push(p);
			promises.push(p.run());
		});

		Promise.all(promises).then((benchmarks) => {
			zak.debug("all benchmarks have finished");
			zak.debug("exporting results");
			zak.results(benchmarks);
		});
	}

	/**
	 * Runs the benchmarks in a synchronous fashion
	 */
	private runSync() {
		zak.debug("running benchmarks in serial mode");
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

		processes.slice(1).forEach((p) => {
			runningBenchmark = runningBenchmark.then((benchmarks) => {
				return p.run().then((b) => {
					benchmarks.push(b);
					return benchmarks;
				});
			});
		});

		runningBenchmark.then((benchmarks) => {
			zak.debug("all benchmarks have finished");
			zak.debug("exporting results");
			zak.results(benchmarks);
		}).catch((err) => {
			zak.info(`\nError in benchmarks: ${JSON.stringify(err)}\n`);
		});
	}
}
