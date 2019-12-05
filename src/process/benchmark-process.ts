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

import { ChildProcess, spawn } from "child_process";
import path from "path";
import { BenchmarkOptions } from "../config";
import { StartMessage } from "./child-process";
import { BenchmarkResult } from "../benchmark";
import BenchmarkError from "./benchmark-error";

/**
 * Wrapper for parent process logic
 */
export default class BenchmarkProcess {
  /**
   * Create new wrapper for the parent process logic
   * @param benchmarkId Id of the benchmark that will be executed
   * @param filepath Filepath of the file, containing the benchmark
   * @param options Options for the Benchmark
   */
  constructor(
    public benchmarkId: string,
    private filepath: string,
    private options: BenchmarkOptions,
  ) {}

  /**
   * Create the child process, start the benchmark and wait for the results
   */
  public async run() {
    this.startProcess();
    const message: StartMessage = {
      benchmarkID: this.benchmarkId,
      filename: this.filepath,
      options: this.options,
    };
    await this.sendToChild(message);
    return this.readFromChild<BenchmarkResult>();
  }

  /**
   * Reference of the child process
   */
  private child: ChildProcess;

  /**
   * Start the child process and wait for it to exit
   */
  private startProcess() {
    const childPath = path.posix.join(__dirname, "./child.js");
    this.child = spawn("node", [childPath]);
  }

  private sendToChild<T>(data: T) {
    return new Promise((res, err) => {
      this.child.stdin.write(JSON.stringify(data), error => {
        if (error) {
          err(error);
        } else {
          this.child.stdin.end(() => {
            res();
          });
        }
      });
    });
  }

  private readFromChild<T>() {
    return new Promise<T>((res, err) => {
      const chunks: string[] = [];
      this.child.stdout.on("data", data => {
        chunks.push(data);
      });

      this.child.stdout.once("end", () => {
        try {
          const complete = chunks.join("");
          res(JSON.parse(complete));
        } catch {
          // error gets handled by stderr
        }
      });

      this.child.stderr.once("data", (data: Buffer) => {
        err(new BenchmarkError(data.toString()));
      });
    });
  }
}
