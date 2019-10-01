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

import { ChildProcess, fork } from "child_process";
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
	private child: ChildProcess;

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
		this.child = fork(childPath);

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
