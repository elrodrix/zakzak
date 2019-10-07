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

import { mergeWith } from "lodash";

import { Benchmark } from "../benchmark";
import { BenchmarkOptions, DefaultBenchmarkOptions } from "../config";

/**
 * Suite is used to literally suite benchmarking files.
 * They can be used nested and beside each other.
 * They are used to group all enclosed suite and benchmark statements
 */
export default class Suite {
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
   * @param options Options that should be applied to this suite and all children inside it
   */
  public constructor(
    public id: string,
    public name: string,
    public callback: Function,
    public filename: string,
    private options: BenchmarkOptions,
  ) {
    this.children = [];
    if (options == null) {
      this.options = DefaultBenchmarkOptions;
    }

    this.options = mergeWith({}, DefaultBenchmarkOptions, options, (a, b) =>
      b === null ? a : undefined,
    );
  }

  /**
   * Returns the options of the suite
   */
  public getOptions() {
    return this.options;
  }

  /**
   * Add discovered children to the suite.
   * Updates the filenames and option fields.
   * Option from parent are used and overwritten by the childs own options.
   * @param args List of children
   */
  public addChild(child: Benchmark | Suite) {
    this.children.push(child);
  }

  public applySetupAndTeardown(setups = this.setups, teardowns = this.teardowns) {
    this.children.forEach(c => {
      c.applySetupAndTeardown(setups, teardowns);
    });
  }

  /**
   * Add setup functions
   * @param fn Setup functions
   */
  public addSetup(...fn: Function[]) {
    this.setups.push(...fn);
  }

  /**
   * Add setup functions at the beginning
   * @param fn Setup functions
   */
  public prependSetup(...fn: Function[]) {
    this.setups.unshift(...fn);
  }

  /**
   * Add teardown functions
   * @param fn Teardown functions
   */
  public addTeardown(...fn: Function[]) {
    this.teardowns.push(...fn);
  }

  private teardowns: Function[] = [];

  private setups: Function[] = [];
}
