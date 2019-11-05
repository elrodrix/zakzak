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

import { merge } from "lodash";

import { DefaultBenchmarkOptions, DefaultBenchmarkManagerOptions, OptionsWrapper } from "./options";

/**
 * The options manager is responsible for keeping the options
 * and merging them with newly applied options
 */
export default class OptionsManager {
  /**
   * The current global benchmarkOptions
   */
  public benchmarkOptions = DefaultBenchmarkOptions;

  /**
   * The current benchmarkmanager options
   */
  public benchmarkManagerOptions = DefaultBenchmarkManagerOptions;

  /**
   * Changes the options, by merging the existing options with the new options.
   * Fields that are left undefined, wont override values.
   * @param options New options that will override current option values
   */
  public change(options: OptionsWrapper) {
    this.benchmarkOptions = merge({}, this.benchmarkOptions, options.benchmark);
    this.benchmarkManagerOptions = merge({}, this.benchmarkManagerOptions, options.manager);
  }

  /**
   * Get all options
   */
  public getOptions(): OptionsWrapper {
    return {
      benchmark: this.benchmarkOptions,
      manager: this.benchmarkManagerOptions,
    };
  }
}
