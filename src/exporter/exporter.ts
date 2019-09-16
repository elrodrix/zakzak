import { BenchmarkResult } from "../benchmark";
import { EventEmitter } from "events";
import { Suite } from "../suite";

export enum ExporterEvents {
	Hierarchy = "hierarchy",
	Result = "result",
	Finished = "finished"
}

export abstract class Exporter {
	constructor(private em: EventEmitter) {
		em.on(ExporterEvents.Hierarchy, this.onHierarchy);
		em.on(ExporterEvents.Result, this.onResult);
		em.on(ExporterEvents.Finished, this.onFinished);
	}
	public abstract onHierarchy(root: Suite[]): void;
	public abstract onResult(result: BenchmarkResult): void;
	public abstract onFinished(results: BenchmarkResult[]): void;
}
