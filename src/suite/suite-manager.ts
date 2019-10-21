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

import Suite from "./suite";
import { Benchmark } from "../benchmark";
import { BenchmarkOptions, DefaultBenchmarkOptions } from "../config";

/**
 * Manages the finding of files, suites and benchmarks,
 * as well as keeping track of the structure and hierarchy.
 */
export default class SuiteManager {
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
    this.setGlobalReference();
  }

  public static getInstance() {
    // This reference prevents typescript from throwing errors during building
    const globalRef = (global as any) as GlobalWithSuiteManager;
    return globalRef.suiteManager;
  }

  public setGlobalReference() {
    // This reference prevents typescript from throwing errors during building
    const globalRef = (global as any) as GlobalWithSuiteManager;
    globalRef.suiteManager = this;
  }

  public addSetup(fn: Function) {
    if (this.currentPath.length > 0) {
      _.last(this.currentPath).addSetup(fn);
    }
  }

  public addTeardown(fn: Function) {
    if (this.currentPath.length > 0) {
      _.last(this.currentPath).addTeardown(fn);
    }
  }

  /**
   * Add suite to list of found suites
   * @param name Name of the suite
   * @param fn Callback function inside the suite
   * @param options Options that will be applied to all children
   */
  public addSuite(name: string, fn: Function, options: BenchmarkOptions) {
    const currentPath = this.currentPath.map(v => v.name).concat(name);
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
    currentSuite.applySetupAndTeardown();
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
    const currentPath = this.currentPath.map(v => v.name).concat(name);
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
    filenames.forEach(filename => {
      const currentSuite = new Suite(
        filename,
        filename,
        () => {
          // eslint-disable-next-line import/no-dynamic-require, global-require
          require(filename);
        },
        filename,
        this.options,
      );
      this.currentPath = [currentSuite];
      currentSuite.callback();
      currentSuite.applySetupAndTeardown();
      this.suites.push(currentSuite);
      this.files.push(currentSuite);
    });
  }

  /**
   * Get a benchmark by it's id
   * @param id Id of the benchmark
   */
  public getBenchmark(id: string) {
    return this.benchmarks.find(b => b.id === id);
  }

  /**
   * Current path that the suite manager is traversing.
   * Needed for creating the id of a suite or benchmark
   */
  private currentPath: Suite[] = [];
}

interface GlobalWithSuiteManager {
  suiteManager: SuiteManager;
}
