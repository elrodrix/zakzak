/*!
 * Copyright 2019, Dynatrace LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import _ from "lodash";

import { Suite } from "../suite";
import { Benchmark } from "../benchmark";
import { BenchmarkOptions, DefaultBenchmarkOptions } from "../config";

/**
 * Used to define an enclosing suite inside a benchmark file. Multiple suites can be neighbours and/or nested
 * @param name Name of the Suite
 * @param fn Suite or benchmark inside this suite
 * @param options Options that will be applied to all  benchmarks enclosed in this suite
 */
export function suite(name: string, fn: Function, options?: BenchmarkOptions): void {
	const mng = SuiteManager.getInstance();
	mng.addSuite(name, fn, options);
}

/**
 * Used to define an benchmark
 * @param name Name of the benchmark
 * @param fn Function that will be benchmarked
 * @param options Options that will be applied for this specific benchmark
 */
export function benchmark(name: string, fn: Function, options?: BenchmarkOptions): void {
	const mng = SuiteManager.getInstance();
	mng.addBenchmark(name, fn, options);
}

/**
 * Manages the finding of files, suites and benchmarks,
 * as well as keeping track of the structure and hierarchy.
 */
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

	/**
	 * Creates new suite manager and sets the singleton instance
	 * @param options Options that will be applied to all the suites and benchmarks found
	 */
	constructor(private options: BenchmarkOptions) {
		this.options = _.merge({}, DefaultBenchmarkOptions, options);
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
		let currentSuite: Suite;
		if (this.currentPath.length !== 0) {
			const filename = this.currentPath[0].name;
			const parent = _.last(this.currentPath);
			const mergedOptions = _.merge({}, parent.getOptions(), options);
			currentSuite = new Suite(id, name, fn, filename, mergedOptions);
			parent.addChild(currentSuite);
		} else {
			const filename = "name";
			const mergedOptions = _.merge({}, DefaultBenchmarkOptions, options);
			currentSuite = new Suite(id, name, fn, filename, mergedOptions);
		}

		this.currentPath.push(currentSuite);
		currentSuite.callback();
		this.currentPath.pop();

		this.suites.push(currentSuite);
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
		let currentBenchmark: Benchmark;
		if (this.currentPath.length !== 0) {
			const filename = this.currentPath[0].name;
			const parent = _.last(this.currentPath);
			const mergedOptions = _.merge({}, parent.getOptions(), options);
			currentBenchmark = new Benchmark(id, name, fn, filename, mergedOptions);
			parent.addChild(currentBenchmark);
		} else {
			const filename = "name";
			const mergedOptions = _.merge({}, DefaultBenchmarkOptions, options);
			currentBenchmark = new Benchmark(id, name, fn, filename, mergedOptions);
		}

		this.benchmarks.push(currentBenchmark);
	}

	/**
	 * Process a list of files, by requiring them and storing found suites and benchmarks
	 * @param filenames List of Filepaths
	 */
	public addFiles(filenames: string[]) {
		filenames.forEach((filename) => {
			const currentSuite = new Suite(filename, filename, () => { require(filename); }, filename, this.options);
			this.currentPath = [currentSuite];
			currentSuite.callback();
			this.suites.push(currentSuite);
			this.files.push(currentSuite);
		});
	}

	/**
	 * Get a benchmark by it's id
	 * @param id Id of the benchmark
	 */
	public getBenchmark(id: string) {
		return this.benchmarks.find((b) => b.id === id);
	}

	/**
	 * Singleton instance of the suitemanager.
	 * Needed for the globals
	 */
	private static instance: SuiteManager;

	/**
	 * Current path that the suite manager is traversing.
	 * Needed for creating the id of a suite or benchmark
	 */
	private currentPath: Suite[] = [];
}
