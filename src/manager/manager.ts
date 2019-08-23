// tslint:disable: no-var-requires
import Benchmark from "../benchmark/benchmark";
import Structure from "./structure";
import BenchmarkProcess from "./benchmark-process";
import { Exporter } from "./exporter";


/**
 * Manages multiple benchmarks, their configuration, runtime seperation and exporting
 */
export default class BenchmarkManager {

	constructor() {
		this.benchmarks = [];
		this.structures = [];
		this.processes = [];
		this.structureTreeRoot = [];
		this.exporters = [];
	}

	public addBenchmark(b: Benchmark) {
		this.benchmarks.push(b);

		return this;
	}


	public addStructure(s: Structure) {
		this.structures.push(s);

		return this;
	}

	/**
     * Run all the benchmarks and print them out
     */
	public run() {
		const promises: Array<Promise<Benchmark>> = [];
		this.benchmarks.forEach((b) => {
			const p = new BenchmarkProcess(b);
			this.processes.push(p);
			promises.push(p.run());
		});

		Promise.all(promises).then((benchmarks) => {
			this.exporters.forEach((e) => e.write(benchmarks));
		});
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
	 * Find all the benchmarks and structuring statements inside the given files
	 * @param files Files in which the benchmarks and structuring statements are
	 */
	public findBenchmarks(files: string[]) {
		this.structureTreeRoot = [];
		// get `structure` and `benchmark` so that they can be used by the files
		require("./globals");
		for (const file of files) {
			const root = new Structure(file, null, file); // used for keeping track of files
			this.structureTreeRoot.push(root);
			const [structures, benchmarks] = this.getChangesAfterRequire(file);
			[...structures, ...benchmarks].forEach((v) => v.filename = file);
			root.children.push(...structures, ...benchmarks);
			this.structures.push(...structures);
			this.benchmarks.push(...benchmarks);

			structures.forEach((s) => {
				this.discoverAllLayers(s);
			});
		}
	}

	/**
	 * Get a specific benchmark using it's name.
	 * @param name Name of the benchmark
	 */
	public getBenchmark(name: string) {
		return this.benchmarks.find((b) => b.name === name);
	}

	/**
	 * Singleton instance of the benchmark manager
	 */
	private static instance: BenchmarkManager;

	/**
	 * Prepend string, which is used for printing out the structure
	 */
	private static prepend: string = "-";

	/**
	 * List of all found and registered benchmarks
	 */
	private benchmarks: Benchmark[];

	/**
	 * List of all found and registered structures
	 */
	private structures: Structure[];

	/**
	 * List containing the root nodes of the structures, which are the files in which the statements are found
	 */
	private structureTreeRoot: Structure[];

	/**
	 * All child processes that will be used for doing the benchmarks
	 */
	private processes: BenchmarkProcess[];

	/**
	 * Exporter used to export the results of the benchmarks
	 */
	private exporters: Exporter[];

	/**
	 * Discover and walk through all layers that are enclosed inside this structure and inside
	 * those enclosed structures and so on.
	 * @param s Structure which layers will be recursively walked through and discovered
	 */
	private discoverAllLayers(s: Structure) {
		if (this.discoverLayer(s) === false) {
			s.children.filter((c) => c instanceof Structure).forEach((c) => {
				this.discoverAllLayers(c as Structure);
			});
		}
	}

	/**
	 * Discover all immediate nodes(structures and benchmarks) enclosed in this structure.
	 * No Recursion
	 * @param s Structure whose child nodes will be discovered
	 */
	private discoverLayer(s: Structure) {
		const [structures, benchmarks] = this.getChangesAfterFunctionCall(s.callback);
		const children = [...structures, ...benchmarks];
		children.forEach((c) => c.filename = s.filename);
		s.addChildren(...children);
		return structures.length === 0;
	}

	/**
	 * Get the newly found structures and benchmarks after requiring a file
	 * @param filename File which will be executed("required")
	 */
	private getChangesAfterRequire(filename: string): [Structure[], Benchmark[]] {
		const fn = () => { require(filename); };
		return this.getChangesAfterFunctionCall(fn);
	}

	/**
	 * Get the newly found structures and benchmarks after the function has been called
	 * @param fn Function which will be called
	 */
	private getChangesAfterFunctionCall(fn: Function): [Structure[], Benchmark[]] {
		const previousStructLength = this.structures.length;
		const previousBenchLength = this.benchmarks.length;
		fn();
		const structs = this.structures.slice(previousStructLength);
		const benchmarks = this.benchmarks.slice(previousBenchLength);
		return [structs, benchmarks];
	}

	/**
	 * Print out the currently discovered structure tree to the console
	 */
	private printStructuretree() {
		this.structureTreeRoot.forEach((file) => {
			console.log(`file: ${file.filename}`);
			file.children.forEach((c) => {
				this.printStructureNode(c, 1);
			});
		});
	}

	/**
	 * Print a node and all its children recursively to the console
	 * @param node Current node from which we will traverse downwards
	 * @param layer Current layer in which the node is
	 */
	private printStructureNode(node: Benchmark | Structure, layer: number) {
		console.log(`${"".padStart(layer, BenchmarkManager.prepend)}${node.name}`);
		if (node instanceof Structure) {
			node.children.forEach((c) => {
				this.printStructureNode(c, layer + 1);
			});
		}
	}
}
