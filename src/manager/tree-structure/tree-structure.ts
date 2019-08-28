import Structure from "../structure";
import Benchmark from "../../benchmark/benchmark";
import OptionsManager from "../../config/options-manager";
import { ExportEmitter } from "../exporter/emitter";

// tslint:disable-next-line: no-var-requires
require("../globals");

export class TreeStructure {

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
	 * Add structure to list of found structures
	 * @param structure found structure
	 */
	public addStructure(structure: Structure) {
		this.structures.push(structure);
	}

	/**
	 * Add benchmark to list of found benchmarks
	 * @param benchmark found benchmark
	 */
	public addBenchmark(benchmark: Benchmark) {
		this.benchmarks.push(benchmark);
	}

	/**
	 * Add a file to the structure. Automatically finds and creates all children
	 * @param filename
	 */
	public addFile(filename: string) {
		this.currentPath = [];

		this.em.debug(`reading file ${filename} into structure tree`);

		const fileStructure = new Structure(
			filename,
			() => {
				this.em.debug(`requiring file ${filename}`);
				require(filename);
			},
			filename,
			OptionsManager.benchmarkOptions
		);

		this.findAllChildren(fileStructure);

		this.files.push(fileStructure);
	}

	/**
	 * Finds a single benchmark
	 * @param b
	 */
	public findBenchmark(b: Benchmark) {
		this.em.debug(`searching benchmark with id ${b.id}`);
		const path = b.id.split(":");
		let current: Benchmark | Structure = this.files.find((s) => s.name === path[0]);
		for (let i = 1, l = path.length; i < l; i++) {
			if (current instanceof Benchmark) {
				this.em.debug(`found benchmark`);
				break;
			}
			current = current.children.find((child) => child.name === path[i]);
		}
		return current as Benchmark;
	}

	private em = ExportEmitter.getInstance();

	private currentPath: string[] = [];

	/**
	 * Returns the immediate children of a structure
	 * @param structure the structure whose children will be searched for
	 */
	private getChildren(structure: Structure): Array<Structure | Benchmark> {
		this.em.debug(`finding direct children of structure ${structure.name}`);
		const [structures, benchmarks] = this.getChangesAfterFunctionCall(structure.callback);
		return [].concat(structures, benchmarks);
	}

	/**
	 * Retrieves all children recursively, that are inside the structure, or inside an enclosed structure.
	 * @param structure the structure whose children will be searched for
	 */
	private findAllChildren(structure: Structure) {
		this.em.debug(`finding all children of structure ${structure.name}`);
		this.currentPath.push(structure.name);
		this.em.debug("adding structure name to current path");
		const children = this.getChildren(structure);
		structure.addChildren(children);
		structure.children.filter((child) => child instanceof Benchmark).forEach((child) => {
			this.em.debug(`setting id of benchmark ${child.name}`);
			(child as Benchmark).id = [...this.currentPath, child.name].join(":");
		});
		structure.children.filter((child) => child instanceof Structure).forEach((child) => {
			this.findAllChildren(child as Structure);
		});
		this.currentPath.splice(this.currentPath.length - 1);
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
}
