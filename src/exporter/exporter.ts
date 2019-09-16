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
		em.on(ExporterEvents.Hierarchy, this.onHierarchy.bind(this));
		em.on(ExporterEvents.Result, this.onResult.bind(this));
		em.on(ExporterEvents.Finished, this.onFinished.bind(this));
	}
	public abstract onHierarchy(root: Suite[]): void;
	public abstract onResult(result: BenchmarkResult): void;
	public abstract onFinished(results: BenchmarkResult[]): void;
}
