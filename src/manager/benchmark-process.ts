import ChildProcess from "child_process";
import path from "path";
import Benchmark from "@zakzak/benchmark/benchmark";
import OptionsManager from "@zakzak/config/options-manager";
import { OptionsWrapper } from "@zakzak/config/options";
import "@zakzak/logging";
import "@globals";

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
		zak.debug(`creating new benchmark process for benchmark ${benchmark.name}`);
	}

	/**
	 * Start the child process and with it the benchmark.
	 * Once the process is finished it will return the benchmark object with the updated results
	 */
	public run() {
		zak.debug(`process with benchmark ${this.benchmark.name} is starting`);
		const childPath = path.posix.join(__dirname, "./child");
		zak.debug("forking process now");
		const child = ChildProcess.fork(childPath, [], { execArgv: ["--allow-natives-syntax"] });
		zak.debug("passing benchmark data to child process");
		const options: OptionsWrapper = {
			benchmark: OptionsManager.benchmarkOptions,
			manager: OptionsManager.benchmarkManagerOptions,
			cli: OptionsManager.cliOptions

		};
		child.send({ benchmark: this.benchmark, options: options });

		return new Promise((res: (value: Benchmark) => void, err) => {
			child.on("message", (msg: Benchmark) => {
				zak.debug(`process with benchmark ${this.benchmark.name} finished`);
				res(msg);
			});

			child.on("error", (e) => {
				zak.debug(`process with benchmark ${this.benchmark.name} has an error`);
				err(e);
			});

			child.on("exit", (code) => {
				zak.debug(`process with benchmark ${this.benchmark.name} has exited with code ${code}`);
				if (code !== 0) {
					err(`exit status ${code}`);
				}
			});
		});
	}
}
