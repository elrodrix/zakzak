// tslint:disable: no-var-requires
import Table from "cli-table";
import ChildProcess from "child_process";
import Benchmark from "../benchmark/benchmark";
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

		this.printStructuretree();

		this.benchmarks.forEach((b) => {
			b.run();
			table.push(
				[b.name, b.mean.toFixed(3), b.marginOfError.toFixed(3), b.standardError.toFixed(3), b.min.toFixed(3), b.max.toFixed(3), b.median.toFixed(3)]
			);
		});

		if (this.benchmarks.length === 0) {
			console.log("no benchmarks found");
		} else {
			console.log(table.toString());
		}
	}

	public static getInstance() {
		if (BenchmarkManager.instance == null) {
			BenchmarkManager.instance = new BenchmarkManager();
		}

		return BenchmarkManager.instance;
	}

	public findBenchmarks(files: string[]) {
		this.structureTreeRoot = [];
		require("./globals");
		for (const file of files) {
			const root = new Structure(file, null, file);
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

	private static instance: BenchmarkManager;

	private static prepend: string = "-";

	private benchmarks: Benchmark[];

	private structures: Structure[];

	private structureTreeRoot: Structure[];

	private processes: BenchmarkProcess[];

	private discoverAllLayers(s: Structure) {
		if (this.discoverLayer(s) === false) {
			s.children.filter((c) => c instanceof Structure).forEach((c) => {
				this.discoverAllLayers(c as Structure);
			});
		}
	}

	private discoverLayer(s: Structure) {
		const [structures, benchmarks] = this.getChangesAfterFunctionCall(s.callback);
		const children = [...structures, ...benchmarks];
		children.forEach((c) => c.filename = s.filename);
		s.addChildren(...children);
		return structures.length === 0;
	}

	private getChangesAfterRequire(filename: string): [Structure[], Benchmark[]] {
		const fn = () => { require(filename); };
		return this.getChangesAfterFunctionCall(fn);
		}

	private getChangesAfterFunctionCall(fn: Function): [Structure[], Benchmark[]] {
		const previousStructLength = this.structures.length;
		const previousBenchLength = this.benchmarks.length;
		fn();
		const structs = this.structures.slice(previousStructLength);
		const benchmarks = this.benchmarks.slice(previousBenchLength);
		return [structs, benchmarks];
	}

	private printStructuretree() {
		this.structureTreeRoot.forEach((file) => {
			console.log(`file: ${file.filename}`);
			file.children.forEach((c) => {
				this.printStructureNode(c, 1);
			});
		});
	}

	private printStructureNode(node: Benchmark | Structure, layer: number) {
		console.log(`${"".padStart(layer, BenchmarkManager.prepend)}${node.name}`);
		if (node instanceof Structure) {
			node.children.forEach((c) => {
				this.printStructureNode(c, layer + 1);
			});
		}
	}

	private createChild(options: BenchmarkOptions) {
		const child = ChildProcess.fork("./child", [], { execArgv: ["--allow-natives-syntax"] });
		child.send(options);
		child.on("message", (msg) => {
			console.log(msg);
			child.kill();
		});
	}


}
