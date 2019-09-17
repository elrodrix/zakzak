import ChildProcess from "child_process";
import path from "path";

import { BenchmarkOptions } from "../config";
import { StartMessage, ExitMessage } from "./child-process";

/**
 * Wrapper for parent process logic
 */
export class BenchmarkProcess {
	/**
	 * Create new wrapper for the parent process logic
	 * @param benchmarkId Id of the benchmark that will be executed
	 * @param filepath Filepath of the file, containing the benchmark
	 * @param options Options for the Benchmark
	 */
	constructor(private benchmarkId: string, private filepath: string, private options: BenchmarkOptions) { }

	/**
	 * Create the child process, start the benchmark and wait for the results
	 */
	public run() {
		const promise = this.startProcess();
		this.setEventHandlers();
		const message: StartMessage = {
			benchmarkID: this.benchmarkId,
			filename: this.filepath,
			options: this.options
		};

		this.child.send(message);

		return promise;
	}

	/**
	 * Reference of the child process
	 */
	private child: ChildProcess.ChildProcess;

	/**
	 * Message that is received, when the child process exits
	 */
	private message: ExitMessage;

	/**
	 * Set the event handlers for the child process
	 */
	private setEventHandlers() {
		this.child.on("message", (msg: ExitMessage) => {
			this.message = msg;
		});
	}

	/**
	 * Start the child process and wait for it to exit
	 */
	private startProcess() {
		// Path to child.ts
		const childPath = path.posix.join(__dirname, "./child");
		this.child = ChildProcess.fork(childPath, [], { execArgv: ["--allow-natives-syntax"] });

		const promise = new Promise((res: (msg: ExitMessage) => void, err) => {
			this.child.on("exit", (code) => {
				if (code === 0) {
					res(this.message);
				} else {
					err(this.message.error);
				}
			});
		});

		return promise;
	}

}
