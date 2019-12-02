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

import TimeUnit from "../time";

/**
 * Options that can be applied to a benchmark.
 * Can be applied to suites too, they will pass them down to a benchmark
 */
export interface BenchmarkOptions {
  /**
   * The minimum time that the warmup procedure has to be run.
   * Also the minimum time for a single cycle.
   */
  minTime?: number;
  /**
   * The minimum amount of samples that have to be collected
   */
  minSamples?: number;
  /**
   * The maximum time allowed for taking samples
   */
  maxTime?: number;
  /**
   * The maximum amount of samples that should be collected
   */
  maxSamples?: number;
  /**
   * The minimum amount of iterations that the code should run in a single benchmark.
   * Ignored if value is equal to, or below zero.
   */
  minIterations?: number;
  /**
   * The maximum amount of iterations that the code should run in a single benchmark.
   * Ignored if value is equal to, or below zero.
   */
  maxIterations?: number;
  /**
   * Flag that enables/disables memory benchmarking.
   */
  memoryBenchmark?: boolean;
  /**
   * Maximum amount of samples/snapshots the memory benchmark should take
   */
  maxMemorySamples?: number;
  /**
   * Minimum amount of samples/snapshots the memory benchmark should take
   */
  minMemorySamples?: number;
}

/**
 * Options for managing part of the benchmarking framework.
 * Contains options for the Suite- and Benchmarkmanager
 */
export interface BenchmarkManagerOptions {
  /**
   * Amount of benchmarks to run in parallel.
   * If the number is smaller than or equal to 1, they will be run in series
   */
  runParallel?: number;
  /**
   * Glob pattern that matches the files containing the benchmarks
   */
  pattern?: string;
  /**
   * Path from which glob will search for files
   */
  path?: string;
  /**
   * List of exporters that will output the benchmark data.
   * Default ones are `console`, `console-async`, `xml`, `json`, `csv` and `hierarchy`.
   * Otherwise a path to an exporter file.
   */
  exporter?: string[];
  /**
   * Path to the config file
   */
  config?: string;
}

/**
 * Wrapper interface for the benchmark and manager options
 */
export interface OptionsWrapper {
  benchmark: BenchmarkOptions;
  manager: BenchmarkManagerOptions;
}

/**
 * The default benchmark options
 */
export const DefaultBenchmarkOptions: BenchmarkOptions = {
  minTime: 50 * TimeUnit.Millisecond,
  minSamples: 5,
  maxTime: 5 * TimeUnit.Second,
  maxSamples: 5000,
  minIterations: 0,
  maxIterations: 0,
  memoryBenchmark: false,
  maxMemorySamples: 10000,
  minMemorySamples: 100,
};

/**
 * The default benchmarkmanager options
 */
export const DefaultBenchmarkManagerOptions: BenchmarkManagerOptions = {
  runParallel: 1,
  pattern: "./**/*.benchmark.js",
  path: "./",
  exporter: ["console"],
  config: "zakzak.config.json",
};
