import { Benchmark, BenchmarkResult } from "./benchmark";
import { BenchmarkOptions, DefaultBenchmarkOptions } from "../config";
import { SuiteManager } from "../suite";

export class ChildProcessHandler {
	public manager: SuiteManager;
	public benchmark: Benchmark;
	public result: BenchmarkResult;
	public options: BenchmarkOptions;

	constructor() {
		this.setEventHandlers();
	}

	private setEventHandlers() {
		process.on("message", this.onStart.bind(this));
		process.on("uncaughtException", this.onError.bind(this));
	}

	private onStart(message: StartMessage) {
		this.options = message.options;
		this.manager = new SuiteManager(this.options);
		this.manager.addFiles([message.filename]);
		this.benchmark = this.manager.getBenchmark(message.benchmarkID);
		if (this.benchmark == null) {
			this.exit(1);
			return;
		}
		this.benchmark.changeOptions(this.options);
		this.runBenchmark();
		this.sendResults();
	}

	private sendResults() {
		const message: ExitMessage = {
			result: this.result
		};
		process.send(message);
		this.exit(0);
	}

	private onError(error: Error) {
		const message: ExitMessage = {
			error: error
		};
		process.send(message);
		this.exit(1);
	}

	private runBenchmark() {
		this.result = this.benchmark.start();
	}

	private exit(status: number) {
		process.exit(status);
	}
}

export interface StartMessage {
	filename: string;
	benchmarkID: string;
	options: BenchmarkOptions;
}

export interface ExitMessage {
	result?: BenchmarkResult;
	error?: Error;
}