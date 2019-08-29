import { EventEmitter } from "events";
import Benchmark from "@zakzak/benchmark/benchmark";
import Structure from "@zakzak/manager/structure";

export const EVENT_RESULTS = "EVENT_RESULTS";
export const EVENT_TREE = "EVENT_TREE";
export const EVENT_LOG = "EVENT_LOG";
export const EVENT_INFO = "EVENT_INFO";
export const EVENT_DEBUG = "EVENT_DEBUG";

export type EVENT_RESULTS = typeof EVENT_RESULTS;
export type EVENT_TREE = typeof EVENT_TREE;
export type EVENT_LOG = typeof EVENT_LOG;
export type EVENT_INFO = typeof EVENT_INFO;
export type EVENT_DEBUG = typeof EVENT_DEBUG;

export type BenchmarkEvents = EVENT_RESULTS | EVENT_TREE | EVENT_LOG | EVENT_INFO | EVENT_DEBUG;
export class ExportEmitter extends EventEmitter {
	public static getInstance() {
		if (ExportEmitter.instance === undefined || ExportEmitter.instance === null) {
			this.instance = new ExportEmitter();
		}
		return this.instance;
	}

	public on(event: BenchmarkEvents, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	public exportResults(results: Benchmark[]) {
		super.emit(EVENT_RESULTS, results);
	}

	public printTree(rootNodes: Structure[]) {
		super.emit(EVENT_TREE, rootNodes);
	}

	public log(message: any, ...optionalParams: any[]) {
		super.emit(EVENT_LOG, message, ...optionalParams);
	}

	public info(message: any, ...optionalParams: any[]) {
		super.emit(EVENT_INFO, message, ...optionalParams);
	}

	public debug(message: any, ...optionalParams: any[]) {
		super.emit(EVENT_DEBUG, message, ...optionalParams);
	}

	private static instance: ExportEmitter;
}
