import ChildProcess from "child_process";
import path from "path";
import { BenchmarkOptions } from "@zakzak/config/options";
import { StartMessage, ExitMessage } from "./child-process";

/**
 * Wrapper for child process that is executing a single benchmark
 */
export class BenchmarkProcess {
	constructor(private benchmarkID: string, private filename: string, private options: BenchmarkOptions) { }

	public run() {
		const promise = this.startProcess();
		this.setEventHandlers();
		const message: StartMessage = {
			benchmarkID: this.benchmarkID,
			filename: this.filename,
			options: this.options
		};
		this.child.send(message);

		return promise;
	}

	private child: ChildProcess.ChildProcess;
	private message: ExitMessage;

	private setEventHandlers() {
		this.child.on("message", (msg: ExitMessage) => {
			this.message = msg;
			console.log(msg);
		});
	}

	private startProcess() {
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
