import _ from "lodash";
import Structure from "structure/structure";
import OptionsManager from "@zakzak/config/options-manager";
import "@zakzak/logging";
import { Benchmark } from "@zakzak/benchmark/benchmark";

// tslint:disable-next-line: no-var-requires
require("../globals");

export class StructureManager {
	/**
	 * List of all files found
	 */
	public files: Structure[] = [];
	/**
	 * List of all found and registered benchmarks
	 */
	public benchmarks: Benchmark[] = [];

	/**
	 * List of all found and registered structures
	 */
	public structures: Structure[] = [];

	/**
	 * Get the singleton instance of the benchmark manager
	 */
	public static getInstance() {
		if (StructureManager.instance == null) {
			StructureManager.instance = new StructureManager();
		}

		return StructureManager.instance;
	}

	/**
	 * Add structure to list of found structures
	 * @param structure found structure
	 */
	public addStructure(name: string, fn: Function, options = OptionsManager.benchmarkOptions) {
		const currentPath = this.currentPath.map((v) => v.name).concat(name);
		const id = _.join(currentPath, ":");
		const filename = this.currentPath[0].name;
		const structure = new Structure(id, name, fn, filename, options);

		const parent = _.last(this.currentPath);
		parent.addChild(structure);

		this.currentPath.push(structure);
		structure.callback();
		this.currentPath.pop();

		this.structures.push(structure);
	}

	/**
	 * Add benchmark to list of found benchmarks
	 * @param benchmark found benchmark
	 */
	public addBenchmark(name: string, fn: Function, options = OptionsManager.benchmarkOptions) {
		const currentPath = this.currentPath.map((v) => v.name).concat(name);
		const id = _.join(currentPath, ":");
		const filename = this.currentPath[0].name;
		const benchmark = new Benchmark(id, name, fn, filename, options);

		const parent = _.last(this.currentPath);
		parent.addChild(benchmark);

		this.benchmarks.push(benchmark);
	}

	public addFiles(filenames: string[]) {
		filenames.forEach((filename) => {
			const structure = new Structure(filename, filename, () => { require(filename); }, filename);
			this.currentPath = [structure];
			structure.callback();
			this.structures.push(structure);
			this.files.push(structure);
		});
	}

	private static instance: StructureManager;

	private currentPath: Structure[] = [];
}
