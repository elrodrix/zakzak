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

import { Benchmark, BenchmarkResult } from "../benchmark";
import { BenchmarkOptions } from "../config";
import { SuiteManager } from "../suite";

/**
 * Handler for the child process logic
 */
export class ChildProcessHandler {
  /**
   * Suite manager that finds, and controls benchmarks and suites
   */
  public manager: SuiteManager;

  /**
   * The benchmark that will be executed
   */
  public benchmark: Benchmark;

  /**
   * Result of the benchmark
   */
  public result: BenchmarkResult;

  /**
   * Options for the benchmark
   */
  public options: BenchmarkOptions;

  /**
   * Registers the event handlers on the process
   */
  public registerEventHandlers() {
    process.on("message", this.onStart.bind(this)); // Once a message is received, then benchmark can start
    process.on("uncaughtException", this.onError.bind(this));
  }

  /**
   * Starts the logic of the child process
   * @param message Message that was received from parent
   */
  private onStart(message: StartMessage) {
    this.options = message.options;
    this.manager = new SuiteManager(this.options);
    this.manager.addFiles([message.filename]); // Find benchmark
    this.benchmark = this.manager.getBenchmark(message.benchmarkID);
    if (this.benchmark == null) {
      this.exit(1);
      return;
    }
    this.runBenchmark();
    this.sendResults();
  }

  /**
   * Send the results of the benchmark to the parent and then exit
   */
  private sendResults() {
    const message: ExitMessage = {
      result: this.result,
    };
    process.send(message);
    this.exit(0);
  }

  /**
   * Send error to the parent and then exit
   * @param error Error that was caught
   */
  private onError(error: Error) {
    const message: ExitMessage = {
      error,
    };
    process.send(message);
    this.exit(1);
  }

  /**
   * Run the benchmark
   */
  private runBenchmark() {
    this.result = this.benchmark.start();
  }

  /**
   * Exit the process
   * @param status Status with which to exit
   */
  private exit = process.exit;
}

/**
 * Start message for the process, received from parent process
 */
interface StartMessage {
  filename: string;
  benchmarkID: string;
  options: BenchmarkOptions;
}

/**
 * Exit message that is sent to parent process, once the process exits
 */
interface ExitMessage {
  result?: BenchmarkResult;
  error?: Error;
}

export { StartMessage, ExitMessage };
