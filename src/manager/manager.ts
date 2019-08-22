import Benchmark from "../benchmark/benchmark";
import Table from "cli-table";
import Structure from "./structure";


export default class BenchmarkManager {

	constructor() {
		this.benchmarks = [];
		this.structures = [];
	}

	/**
     * Add a function that will be benchmarked
     * @param name Name of the function for display purposes
     * @param fn The function that will be benchmarked
     */
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
		const table = new Table({
			head: ["Name", "Execution time", "Margin of Error", "Standard Error", "Min", "Max", "Median"]
		});

		this.createStructureTree();
		this.printStructuretree();

		this.benchmarks.forEach((b) => {
			b.run();
			table.push(
				[b.name, b.mean.toFixed(3), b.marginOfError.toFixed(3), b.standardError.toFixed(3), b.min.toFixed(3), b.max.toFixed(3), b.median.toFixed(3)]
			);
		});

		console.log(table.toString());
	}

	public static getInstance() {
		if (BenchmarkManager.instance == null) {
			BenchmarkManager.instance = new BenchmarkManager();
		}

		return BenchmarkManager.instance;
	}

	private static instance: BenchmarkManager;

	private benchmarks: Benchmark[];

	private structures: Structure[];

	private structureTreeRoot: Array<Structure | Benchmark>;

	private discoverLayer(s: Structure) {
		const previousStructLength = this.structures.length;
		const previousBenchLength = this.benchmarks.length;
		s.callback();
		const structs = this.structures.slice(previousStructLength);
		const benchmarks = this.benchmarks.slice(previousBenchLength);
		s.addChildren(...structs, ...benchmarks);
		return structs.length === 0;
	}

	private discoverAllLayers(s: Structure) {
		const res = this.discoverLayer(s);
		if (res === false) {
			s.children.forEach((value) => {
				if (value instanceof Structure) {
					this.discoverAllLayers(value);
				}
			});
		}
	}

	private createStructureTree() {
		this.structureTreeRoot = [];
		this.structures.forEach((s) => {
			this.structureTreeRoot.push(s);
			this.discoverAllLayers(s);
		});
	}

	private printStructuretree(prepend = "") {
		this.structureTreeRoot.forEach((v) => {
			console.log(`${prepend}${v.name}`);
			if (v instanceof Structure) {
				v.children.forEach((c) => {
					this.printStructureNode(c, `* ${prepend}`);
				});
			}
		});
	}

	private printStructureNode(node: Benchmark | Structure, prepend = "") {
		console.log(`${prepend}${node.name}`);
		if (node instanceof Structure) {
			node.children.forEach((c) => {
				this.printStructureNode(c, `* ${prepend}`);
			});
		}
	}
}
