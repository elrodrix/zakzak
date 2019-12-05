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

import PromisePool from "es6-promise-pool";

import { Benchmark, BenchmarkResult } from "../benchmark";
import { BenchmarkManagerOptions } from "../config";
import { ExportManager } from "../exporter";
import { BenchmarkProcess } from "../process";

/**
 * Manages multiple benchmarks, their configuration, runtime seperation and exporting
 */
export default class BenchmarkManager {
  constructor(
    public benchmarks: Benchmark[],
    public options: BenchmarkManagerOptions,
    private exporter: ExportManager,
  ) {}

  /**
   * Run all the benchmarks and export them
   */
  public async run() {
    const results = await this.runParallel();
    this.exporter.exportFinished(results);
    return results;
  }

  /**
   * Get Benchmarkprocesses for all the benchmarks
   */
  private getProcesses(): BenchmarkProcess[] {
    return this.benchmarks.map(b => new BenchmarkProcess(b.id, b.filepath, b.getOptions()));
  }

  /**
   * Runs all the benchmarks.
   * Groups multiple benchmarks together, as specified in `options.runparallel`.
   * Runs all benchmarks in a group in parallel.
   * Runs the groups in series
   */
  private runParallel() {
    const processes = this.getProcesses();
    const { exporter } = this;
    const results: BenchmarkResult[] = [];

    const producer = () => {
      if (processes.length > 0) {
        const p = processes.shift();
        return p
          .run()
          .then(result => {
            exporter.exportResult(result);
            results.push(result);
          })
          .catch((error: Error) => {
            exporter.exportError(error, p.benchmarkId);
          });
      }
      return null;
    };

    const pool = new PromisePool(producer, this.options.runParallel);

    return pool.start().then(() => {
      return results;
    });
  }
}
