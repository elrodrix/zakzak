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

import { BenchmarkOptions } from "../config";
import { SuiteManager } from "../suite";

/**
 * Handler for the child process logic
 */
export class ChildProcessHandler {
  public static readFromParent<T>() {
    return new Promise<T>((res, err) => {
      const chunks: string[] = [];
      process.stdin.on("data", data => {
        chunks.push(data.toString());
      });

      process.stdin.once("end", () => {
        try {
          const complete = chunks.join("");
          res(JSON.parse(complete));
        } catch (error) {
          err(error);
        }
      });
    });
  }

  /**
   * Starts the logic of the child process
   * @param message Message that was received from parent
   */
  public static async startBenchmark(message: StartMessage) {
    const sm = new SuiteManager(message.options);
    sm.addFiles([message.filename]); // Find benchmark
    const b = sm.getBenchmark(message.benchmarkID);
    if (b == null) {
      throw new Error("BenchmarkNotFound");
    }

    return b.start();
  }

  public static async sendToParent<T>(data: T) {
    return new Promise(res => {
      const json = JSON.stringify(data);
      process.stdout.write(json, () => {
        res();
      });
    });
  }
}

/**
 * Start message for the process, received from parent process
 */
interface StartMessage {
  filename: string;
  benchmarkID: string;
  options: BenchmarkOptions;
}

export { StartMessage };
