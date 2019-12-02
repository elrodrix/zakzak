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

import { createObjectCsvWriter } from "csv-writer";
import { Exporter } from "../exporter";
import { BenchmarkResult } from "../../benchmark";

export default class CsvExporter extends Exporter {
  public onFinished(results: BenchmarkResult[]): void {
    const csvWriter = createObjectCsvWriter({
      path: "benchmark.data.csv",
      header: [
        { id: "name", title: "Name" },
        { id: "file", title: "File" },
        { id: "measurements", title: "Measurements" },
        { id: "cycles", title: "Cycles" },
        { id: "mean", title: "Mean" },
        { id: "median", title: "Median" },
        { id: "mode", title: "Mode" },
        { id: "stddev", title: "StdandardDeviation" },
        { id: "stderr", title: "StdandardError" },
        { id: "moe", title: "MarginOfError" },
        { id: "min", title: "Min" },
        { id: "max", title: "Max" },
        { id: "mem", title: "Memory" },
      ],
    });

    const records = results.map(r => {
      return {
        name: r.name,
        file: r.filename,
        measurements: r.times.length,
        cycles: r.count,
        mean: r.stats.mean,
        median: r.stats.median,
        mode: r.stats.mode,
        stddev: r.stats.standardDeviation,
        stderr: r.stats.standardError,
        moe: r.stats.marginOfError,
        min: r.stats.min,
        max: r.stats.max,
        mem: r.memoryUsage ? r.memoryUsage : 0,
      };
    });

    csvWriter.writeRecords(records);
  }
}
