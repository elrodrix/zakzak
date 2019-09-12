import _ from "lodash";

import { Suite } from "../suite";
import { Benchmark } from "../benchmark";
import { BenchmarkOptions, DefaultBenchmarkOptions } from "../config";

// tslint:disable-next-line: variable-name
const _global = global as any;
_global.suite = (name: string, fn: Function, options: BenchmarkOptions = DefaultBenchmarkOptions) => {
	const mng = SuiteManager.getInstance();
	mng.addSuite(name, fn, options);
};
_global.benchmark = (name: string, fn: Function, options: BenchmarkOptions = DefaultBenchmarkOptions) => {
	const mng = SuiteManager.getInstance();
	mng.addBenchmark(name, fn, options);
};

export class SuiteManager {
	/**
	 * List of all files found
	 */
	public files: Suite[] = [];
	/**
	 * List of all found and registered benchmarks
	 */
	public benchmarks: Benchmark[] = [];

	/**
	 * List of all found and registered suites
	 */
	public suites: Suite[] = [];

	constructor(private options: BenchmarkOptions) {
		SuiteManager.instance = this;
	}

	/**
	 * Get the singleton instance of the benchmark manager
	 */
	public static getInstance() {
		if (this.instance == null) {
			SuiteManager.instance = new SuiteManager(DefaultBenchmarkOptions);
		}
		return SuiteManager.instance;
	}

	/**
	 * Add suite to list of found suites
	 * @param name Name of the suite
	 * @param fn Callback function inside the suite
	 * @param options Options that will be applied to all children
	 */
	public addSuite(name: string, fn: Function, options: BenchmarkOptions) {
		const currentPath = this.currentPath.map((v) => v.name).concat(name);
		const id = _.join(currentPath, ":");
		const filename = this.currentPath[0].name;
		const suite = new Suite(id, name, fn, filename, _.merge({}, this.options, options));

		const parent = _.last(this.currentPath);
		parent.addChild(suite);

		this.currentPath.push(suite);
		suite.callback();
		this.currentPath.pop();

		this.suites.push(suite);
	}

	/**
	 * Add benchmark to list of found benchmarks
	 * @param name Name of the benchmark
	 * @param fn Function that will be benchmarked
	 * @param options Options for this benchmark
	 */
	public addBenchmark(name: string, fn: Function, options: BenchmarkOptions) {
		const currentPath = this.currentPath.map((v) => v.name).concat(name);
		const id = _.join(currentPath, ":");
		const filename = this.currentPath[0].name;
		const benchmark = new Benchmark(id, name, fn, filename, _.merge({}, this.options, options));

		const parent = _.last(this.currentPath);
		parent.addChild(benchmark);

		this.benchmarks.push(benchmark);
	}

	public addFiles(filenames: string[]) {
		filenames.forEach((filename) => {
			const suite = new Suite(filename, filename, () => { require(filename); }, filename);
			this.currentPath = [suite];
			suite.callback();
			this.suites.push(suite);
			this.files.push(suite);
		});
	}

	public getBenchmark(id: string) {
		return this.benchmarks.find((b) => b.id === id);
	}

	private static instance: SuiteManager;

	private currentPath: Suite[] = [];
}
