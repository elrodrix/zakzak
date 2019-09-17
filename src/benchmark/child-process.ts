import { Benchmark, BenchmarkResult } from "./benchmark";
import { BenchmarkOptions, DefaultBenchmarkOptions } from "../config";
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
	 * Creates new handler and register all the event handlers
	 */
	constructor() {
		this.registerEventHandlers();
	}

	/**
	 * Registers the event handlers on the process
	 */
	private registerEventHandlers() {
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
		this.manager.addFiles([message.filename]);	// Find benchmark
		this.benchmark = this.manager.getBenchmark(message.benchmarkID);
		if (this.benchmark == null) {
			this.exit(1);
			return;
		}
		this.benchmark.changeOptions(this.options); // Apply options from parent
		this.runBenchmark();
		this.sendResults();
	}

	/**
	 * Send the results of the benchmark to the parent and then exit
	 */
	private sendResults() {
		const message: ExitMessage = {
			result: this.result
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
			error: error
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
	private exit(status: number) {
		process.exit(status);
	}
}

/**
 * Start message for the process, received from parent process
 */
export interface StartMessage {
	filename: string;
	benchmarkID: string;
	options: BenchmarkOptions;
}

/**
 * Exit message that is sent to parent process, once the process exits
 */
export interface ExitMessage {
	result?: BenchmarkResult;
	error?: Error;
}
