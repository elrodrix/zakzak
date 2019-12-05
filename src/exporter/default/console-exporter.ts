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

import { last } from "lodash";
import { table } from "table";
import chalk from "chalk";
import { Exporter } from "../exporter";
import { BenchmarkResult } from "../../benchmark";
import TimeUnit from "../../time";

/**
 * Exports results to the console once all benchmarks are done
 */
export default class ConsoleExporter extends Exporter {
  public onFinished(results: BenchmarkResult[]): void {
    const header = [
      "Name",
      "Measurements",
      "Iterations",
      "Median",
      "StdDev",
      "Min",
      "Max",
      "Memory",
    ];
    const data = results.map(r => [
      r.name,
      r.times.length,
      r.count,
      ConsoleExporter.nsToPrettyString(r.stats.median),
      ConsoleExporter.nsToPrettyString(r.stats.standardDeviation),
      ConsoleExporter.nsToPrettyString(r.stats.min),
      ConsoleExporter.nsToPrettyString(r.stats.max),
      r.memoryUsage ? `${r.memoryUsage} bytes` : "-",
    ]);

    data.push(
      ...this.errors.map(e => [
        chalk.red(last(e.id.split(":"))),
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
      ]),
    );

    const output = table([header, ...data]);

    console.log(output);

    if (this.errors.length > 0) {
      console.log(chalk.red(`\n${this.errors.length} benchmarks failed.\n`));
      console.log(
        chalk.red(
          this.errors
            .map(v => `* ${v.id} failed with:\n\t${v.error.message.replace("\n", "\n\t")}`)
            .join("\n"),
        ),
      );
      console.log();
    }
  }

  public onError(error: Error, benchmarkId: string) {
    this.errors.push({ id: benchmarkId, error });
  }

  private errors: { error: Error; id: string }[] = [];

  private static nsToPrettyString(time: number) {
    let unit = "ns";
    let convertedTime = time;
    if (time >= TimeUnit.Second) {
      unit = "s";
      convertedTime = time / TimeUnit.Second;
    } else if (time >= TimeUnit.Millisecond) {
      unit = "ms";
      convertedTime = time / TimeUnit.Millisecond;
    } else if (time >= TimeUnit.Microsecond) {
      unit = "µs";
      convertedTime = time / TimeUnit.Microsecond;
    }

    const maxLength = 3;
    const timeString = convertedTime.toString();
    const parts = timeString.split(".");
    const beforeComma = parts[0];
    const afterComma = parts[1] !== undefined ? parts[1] : "";
    const availableLength = Math.max(0, maxLength - beforeComma.length);
    return `${beforeComma}${availableLength === 0 ? "" : "."}${afterComma.substring(
      0,
      availableLength,
    )}${unit}`;
  }
}
