import SuiteManager from "./suite-manager";
import { BenchmarkOptions } from "../config";

/**
 * Used to define an enclosing suite inside a benchmark file. Multiple suites can be neighbours and/or nested
 * @param name Name of the Suite
 * @param fn Suite or benchmark inside this suite
 * @param options Options that will be applied to all  benchmarks enclosed in this suite
 */
export function suite(name: string, fn: Function, options?: BenchmarkOptions): void {
  const mng = SuiteManager.getInstance();
  mng.addSuite(name, fn, options);
}

/**
 * Used to define an benchmark
 * @param name Name of the benchmark
 * @param fn Function that will be benchmarked
 * @param options Options that will be applied for this specific benchmark
 */
export function benchmark(name: string, fn: Function, options?: BenchmarkOptions): void {
  const mng = SuiteManager.getInstance();
  mng.addBenchmark(name, fn, options);
}

/**
 * Used to define code that should be executed before the benchmarking begins
 * @param fn Code that will be executed
 */
export function setup(fn: Function) {
  const mng = SuiteManager.getInstance();
  mng.addSetup(fn);
}

/**
 * Used to define code that should be executed once the benchmarking is finished
 * @param fn Code that will be executed
 */
export function teardown(fn: Function) {
  const mng = SuiteManager.getInstance();
  mng.addTeardown(fn);
}
