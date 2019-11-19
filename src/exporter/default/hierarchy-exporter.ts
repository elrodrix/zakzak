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

import { terminal } from "terminal-kit";
import { Exporter } from "../exporter";
import { Suite } from "../../suite";
import { Benchmark, BenchmarkResult } from "../../benchmark";
import TimeUnit from "../../time";

export default class HierarchyExporter extends Exporter {
  lines: LogLine[];

  onResult(result: BenchmarkResult) {
    for (let i = 0, l = this.lines.length; i < l; i++) {
      if ((this.lines[i] as BenchmarkLogLine).benchmarkId != null) {
        const line = this.lines[i] as BenchmarkLogLine;
        if (line.benchmarkId === result.id) {
          terminal.previousLine(this.lines.length - i);
          terminal.eraseLineAfter();
          console.log(
            `${line.text}  ✔️   ${HierarchyExporter.nsToPrettyString(result.stats.median)}`,
          );
          terminal.nextLine(this.lines.length - i);
        }
      }
    }
  }

  onHierarchy(root: Suite[]) {
    this.lines = [];
    this.printLayer(root);
    for (let i = 0, l = this.lines.length; i < l; i++) {
      console.log(this.lines[i].text);
    }
  }

  public onError(error: Error, benchmarkId: string): void {
    for (let i = 0, l = this.lines.length; i < l; i++) {
      if ((this.lines[i] as BenchmarkLogLine).benchmarkId != null) {
        const line = this.lines[i] as BenchmarkLogLine;
        if (line.benchmarkId === benchmarkId) {
          terminal.previousLine(this.lines.length - i);
          terminal.eraseLineAfter();
          console.log(`${line.text}  ❌   ${error.name}`);
          terminal.nextLine(this.lines.length - i);
        }
      }
    }
  }

  printLayer(suites: Array<Suite | Benchmark>, indentCount = 0, symbol = "📄") {
    suites.forEach(s => {
      const indentation = "  ".repeat(indentCount);
      if (s instanceof Suite) {
        const text = `${indentation}${symbol} ${s.name}`;
        const line: SuiteLogLine = {
          text,
          suiteId: s.id,
        };
        this.lines.push(line);
        this.printLayer(s.children, indentCount + 1, "📦");
      } else if (s instanceof Benchmark) {
        const text = `${indentation} ${s.name}`;
        const line: BenchmarkLogLine = {
          text,
          benchmarkId: s.id,
        };
        this.lines.push(line);
      }
    });
  }

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

interface LogLine {
  text: string;
}

interface BenchmarkLogLine extends LogLine {
  benchmarkId: string;
}

interface SuiteLogLine extends LogLine {
  suiteId: string;
}
