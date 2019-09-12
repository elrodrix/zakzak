import _ from "lodash";
import { Benchmark } from "@zakzak/benchmark/benchmark";
import { BenchmarkOptions } from "@zakzak/config/options";

/**
 * Suite is used to literally suite benchmarking files.
 * They can be used nested and beside each other.
 * They are used to group all enclosed suite and benchmark statements
 */
export class Suite {

	/**
	 * All the children that are enclosed in this suite
	 */
	public children: Array<Benchmark | Suite>;

	/**
	 * Create new suite
	 * @param id Unique id of this suite
	 * @param name Name of this suite
	 * @param callback Callback which will reveal all the children enclosed in this suite
	 * @param filename Name of the file, in which this suite is found
	 * @param options Options that will be applied to this suite and all children inside it
	 */
	public constructor(public id: string, public name: string, public callback: Function, public filename: string, public options: BenchmarkOptions = {}) {
		this.children = new Array();
	}

	/**
	 * Add discovered children to the suite.
	 * Updates the filenames and option fields.
	 * Option from parent are used and overwritten by the childs own options.
	 * @param args List of children
	 */
	public addChild(child: Benchmark | Suite) {
		child.options = _.merge({}, this.options, child.options);
		this.children.push(child);
	}
}
