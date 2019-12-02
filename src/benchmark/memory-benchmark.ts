import GarbageCollector from "./garbage-collector";
import { BenchmarkOptions } from "../config";

export class MemoryBenchmark {
  constructor(
    private fn: Function,
    private count: number,
    private async: boolean,
    private options: BenchmarkOptions,
  ) {
    GarbageCollector.init();
    this.count = Math.min(
      Math.max(this.options.minMemorySamples, this.count),
      this.options.maxMemorySamples,
    );
  }

  async start() {
    if (this.async) {
      return this.runAsync();
    }
    return Promise.resolve(this.run());
  }

  /**
   * Measure the function once.
   * Garbage collection before and after function call.
   */
  measureOnce() {
    const snapshot: any = {};
    GarbageCollector.collect();
    snapshot.pre = process.memoryUsage();
    this.fn();
    snapshot.during = process.memoryUsage();
    GarbageCollector.collect();
    snapshot.after = process.memoryUsage();

    return snapshot as Snapshot;
  }

  /**
   * Measure the function once.
   * Garbage collection before and after function call.
   */
  async measureOnceAsync() {
    const snapshot: any = {};
    GarbageCollector.collect();
    snapshot.pre = process.memoryUsage();
    await this.fn();
    snapshot.during = process.memoryUsage();
    GarbageCollector.collect();
    snapshot.after = process.memoryUsage();

    return snapshot as Snapshot;
  }

  /**
   * Measures the function multiple times
   */
  run() {
    const snaps = [];

    for (let i = 0; i < this.count; i++) {
      const snapshotSingle = this.measureOnce();
      snaps.push(snapshotSingle);
    }

    return snaps;
  }

  /* eslint-disable no-await-in-loop */
  /**
   * Measures the function multiple times
   */
  async runAsync() {
    const snaps = [];

    for (let i = 0; i < this.count; i++) {
      const snapshotSingle = await this.measureOnceAsync();
      snaps.push(snapshotSingle);
    }

    return snaps;
  }
}

interface Snapshot {
  pre: NodeJS.MemoryUsage;
  during: NodeJS.MemoryUsage;
  after: NodeJS.MemoryUsage;
}

export { Snapshot };
