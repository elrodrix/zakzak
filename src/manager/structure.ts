import Benchmark from "./../benchmark/benchmark";

/**
 * Structure is used to literally structure benchmarking files.
 * They can be used nested and beside each other.
 * They are used to group all enclosed structure and benchmark statements
 */
export default class Structure {

	/**
	 * All the children that are enclosed in this structure. Not recursive
	 */
	public children: Array<Benchmark | Structure>;

	/**
	 * Create new structure
	 * @param name Name of this structure
	 * @param callback Callback which will reveal all the children enclosed in this structure
	 * @param filename Name of the file, in which this structure is found
	 * @param options Options that will be applied to this structure and all children inside it
	 */
	public constructor(public name: string, public callback: Function, public filename?: string, private options?: BenchmarkOptions | StructureOptions) {
		this.children = new Array();
	}

	/**
	 * Add discovered children to the structure
	 * @param args List of children
	 */
	public addChildren(...args: Array<Benchmark | Structure>) {
		this.children.push(...args);
	}
}
