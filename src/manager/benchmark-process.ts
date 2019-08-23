import ChildProcess from "child_process";
import Benchmark from "../benchmark/benchmark";
import path from "path";

/**
 * Wrapper for child process that is executing a single benchmark
 */
export default class BenchmarkProcess {

	/**
	 * Create the wrapper and pass it the benchmark which will be executed by the child process
	 * @param benchmark The benchmark that will be executed.
	 * The benchmark will be sent in json format to the child process,
	 * so all information besides the actual function will be passed on
	 */
	constructor(private benchmark: Benchmark) { }

	/**
	 * Start the child process and with it the benchmark.
	 * Once the process is finished it will return the benchmark object with the updated results
	 */
	public run() {
		const childPath = path.posix.join(__dirname, "./child");
		const child = ChildProcess.fork(childPath, [], { execArgv: ["--allow-natives-syntax"] });
		child.send(this.benchmark);

		return new Promise((res: (value: Benchmark) => void, err) => {
			child.on("message", (msg: Benchmark) => {
				res(msg);
			});

			child.on("error", (e) => {
				err(e);
			});

			child.on("exit", (code) => {
				if (code !== 0) {
					err(`exit status ${code}`);
				}
			});
		});
	}
}
