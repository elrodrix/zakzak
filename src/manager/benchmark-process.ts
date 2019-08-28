import ChildProcess from "child_process";
import Benchmark from "../benchmark/benchmark";
import path from "path";
import OptionsManager from "../config/options-manager";
import { OptionsWrapper } from "../config/options";

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
	constructor(private benchmark: Benchmark) {
		console.debug(`creating new benchmark process for benchmark ${benchmark.name}`);
	}

	/**
	 * Start the child process and with it the benchmark.
	 * Once the process is finished it will return the benchmark object with the updated results
	 */
	public run() {
		console.debug(`process with benchmark ${this.benchmark.name} is starting`);
		const childPath = path.posix.join(__dirname, "./child");
		console.debug("forking process now");
		const child = ChildProcess.fork(childPath, [], { execArgv: ["--allow-natives-syntax"] });
		console.debug("passing benchmark data to child process");
		const options: OptionsWrapper = {
			benchmark: OptionsManager.benchmarkOptions,
			manager: OptionsManager.benchmarkManagerOptions,
			cli: OptionsManager.cliOptions

		};
		child.send({ benchmark: this.benchmark, options: options });

		return new Promise((res: (value: Benchmark) => void, err) => {
			child.on("message", (msg: Benchmark) => {
				console.debug(`process with benchmark ${this.benchmark.name} finished`);
				res(msg);
			});

			child.on("error", (e) => {
				console.debug(`process with benchmark ${this.benchmark.name} has an error`);
				err(e);
			});

			child.on("exit", (code) => {
				console.debug(`process with benchmark ${this.benchmark.name} has exited with code ${code}`);
				if (code !== 0) {
					err(`exit status ${code}`);
				}
			});
		});
	}
}
