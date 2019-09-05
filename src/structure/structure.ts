import _ from "lodash";
import Benchmark from "@zakzak/benchmark/benchmark";
import { BenchmarkOptions } from "@zakzak/config/options";
import "@zakzak/logging";

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
	 * @param id Unique id of this structure
	 * @param name Name of this structure
	 * @param callback Callback which will reveal all the children enclosed in this structure
	 * @param filename Name of the file, in which this structure is found
	 * @param options Options that will be applied to this structure and all children inside it
	 */
	public constructor(public id: string, public name: string, public callback: Function, public filename: string, public options: BenchmarkOptions = {}) {
		this.children = new Array();
	}

	/**
	 * Add discovered children to the structure.
	 * Updates the filenames and option fields.
	 * Option from parent are used and overwritten by the childs own options.
	 * @param args List of children
	 */
	public addChild(child: Benchmark | Structure) {
		child.options = _.merge({}, this.options, child.options);
		this.children.push(child);
	}
}
