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

import path from "path";
import fs from "fs";

import { EventEmitter } from "events";
import { BenchmarkManagerOptions } from "../config";
import { BenchmarkResult } from "../benchmark";
import {
  ConsoleExporter,
  JsonExporter,
  CsvExporter,
  XmlExporter,
  ConsoleAsyncExporter,
} from "./default";
import { Exporter, ExporterEvents } from "./exporter";
import { Suite } from "../suite";

/**
 * Manages the default and custom exporters.
 * Instantiates them and passes them the EventEmitter.
 */
export default class ExportManager {
  /**
   * Creates a new export manager and instantiates the exporters from the options.
   * Finds and instantiates custom exporters, if specified in the options.
   * @param options Options containing the list of exporters
   */
  constructor(private options: BenchmarkManagerOptions) {
    // The event emitter that will passed to the exporters
    this.em = new EventEmitter();
    this.initExporters();
  }

  /**
   * Trigger the hierarchy event
   */
  public exportHierarchy(root: Suite[]) {
    this.em.emit(ExporterEvents.Hierarchy, root);
  }

  /**
   * Trigger the result event
   */
  public exportResult(result: BenchmarkResult) {
    this.em.emit(ExporterEvents.Result, result);
  }

  /**
   * Trigger the finished event
   */
  public exportFinished(results: BenchmarkResult[]) {
    this.em.emit(ExporterEvents.Finished, results);
  }

  private em: EventEmitter;

  /**
   * Get all the exporters from the exports field in the options
   */
  private initExporters() {
    return this.options.exporter.map(e => this.getExporter(e)).filter(e => e != null);
  }

  /**
   * Get the exporter from a string in the exporter options.
   * If exporterString matches a default exporter it uses a default exporter.
   * If none match, then it uses the exporterString as filename of a custom exporter
   * @param exporterString String defining either a default exporter or the path to a custom exporter
   */
  private getExporter(exporterString: string) {
    let exporter: Exporter;
    if (exporterString !== "") {
      switch (exporterString) {
        case "console":
          exporter = new ConsoleExporter(this.em);
          break;
        case "console-async":
          exporter = new ConsoleAsyncExporter(this.em);
          break;
        case "json":
          exporter = new JsonExporter(this.em);
          break;
        case "csv":
          exporter = new CsvExporter(this.em);
          break;
        case "xml":
          exporter = new XmlExporter(this.em);
          break;
        default: {
          const filepath = path.resolve(path.posix.join(process.cwd(), exporterString));
          if (fs.existsSync(filepath)) {
            exporter = this.requireExporter(filepath);
          }
          break;
        }
      }
    }

    return exporter;
  }

  /**
   * Requires a file and tries to instantiate an exported member.
   * If this fails, the method returns null.
   * @param filepath
   */
  private requireExporter(filepath: string): Exporter {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
      const exports = require(filepath);
      const Exported: new (em: EventEmitter) => Exporter = Object.keys(exports).map(
        v => exports[v],
      )[0];
      const exporter = new Exported(this.em);
      return exporter;
    } catch {
      return null;
    }
  }
}
