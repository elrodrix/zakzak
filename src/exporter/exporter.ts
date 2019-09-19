import { BenchmarkResult } from "../benchmark";
import { EventEmitter } from "events";
import { Suite } from "../suite";

/**
 * Possible events that the exporter can listen on
 */
export enum ExporterEvents {
	Hierarchy = "hierarchy",
	Result = "result",
	Finished = "finished"
}

/**
 * Exporter Abstraction that can be used for implementing a custom exporter
 */
export abstract class Exporter {
	/**
	 * Instantiate a new Exporter
	 * @param em EventEmitter that emits events from inside the benchmarking process
	 */
	constructor(private em: EventEmitter) {
		em.on(ExporterEvents.Hierarchy, this.onHierarchy.bind(this));
		em.on(ExporterEvents.Result, this.onResult.bind(this));
		em.on(ExporterEvents.Finished, this.onFinished.bind(this));
	}
	/**
	 * Gets triggered when the suite manager has finished looking for benchmarks.
	 * Returns the found structure
	 * @param root The root suites of the hierarchy. Usually these suites are the files
	 */
	public onHierarchy(root: Suite[]): void { }
	/**
	 * Gets triggered when a single benchmark has finished and returned a result
	 * @param result The result of the finished benchmark
	 */
	public onResult(result: BenchmarkResult): void { }
	/**
	 * Gets triggered when all of the benchmarks have finished and the benchmarkmanager is done.
	 * @param results All the benchmark results
	 */
	public onFinished(results: BenchmarkResult[]): void { }
}
