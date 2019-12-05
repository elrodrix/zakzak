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

import { createStream } from "table";
import { EventEmitter } from "events";
import { last } from "lodash";
import chalk from "chalk";

import { BenchmarkResult } from "../../benchmark";
import { Exporter } from "../exporter";
import TimeUnit from "../../time";

/**
 * Exports live results to the console, showing a result as soon as a benchmark is done.
 */
export default class ConsoleAsyncExporter extends Exporter {
  /**
   * Creates new exporter, writes the header of the table
   * to the console and creates the stream writer that will update when new results come in
   */
  constructor(em: EventEmitter) {
    super(em);
    const header = ["Name", "Samples", "Iterations", "Median", "StdDev", "Min", "Max", "Memory"];
    const config = {
      columnDefault: {
        width: 15,
      },
      columnCount: header.length,
    };

    // @types/table has wrong/old typedefs for createStream.
    this.stream = (createStream(config) as unknown) as { write: (msg: string[]) => void };

    this.stream.write(header);
  }

  /**
   * Add a new
   * @param result
   */
  public onResult(result: BenchmarkResult): void {
    this.stream.write([
      result.name,
      String(result.times.length),
      String(result.count),
      ConsoleAsyncExporter.nsToPrettyString(result.stats.median),
      ConsoleAsyncExporter.nsToPrettyString(result.stats.standardDeviation),
      ConsoleAsyncExporter.nsToPrettyString(result.stats.min),
      ConsoleAsyncExporter.nsToPrettyString(result.stats.max),
      result.memoryUsage ? `${result.memoryUsage} bytes` : "-",
    ]);
  }

  public onFinished(): void {
    if (this.errors.length > 0) {
      console.log(chalk.red(`\n${this.errors.length} benchmarks failed.\n`));
      console.log(
        chalk.red(
          this.errors
            .map(
              v =>
                `* ${v.id} failed with:\n\t${v.error.name}\n\t${v.error.message?.replace(
                  "\n",
                  "\n\t",
                )}`,
            )
            .join("\n"),
        ),
      );
      console.log();
    }
  }

  public onError(error: Error, benchmarkId: string) {
    this.errors.push({ id: benchmarkId, error });
    this.stream.write([chalk.red(last(benchmarkId.split(":"))), "-", "-", "-", "-", "-", "-", "-"]);
  }

  private errors: { error: Error; id: string }[] = [];

  private stream: { write: (msg: string[]) => void };

  /**
   * Converts nanosecond times to a more readable format.
   * Always 3 digit long, excluding the coma/dot.
   */
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
