import ChildProcess from "child_process";
import path from "path";
import Benchmark from "@zakzak/benchmark/benchmark";
import OptionsManager from "@zakzak/config/options-manager";
import { OptionsWrapper } from "@zakzak/config/options";
import "@zakzak/logging";
import "globals";
import { EventMessage } from "@zakzak/exporter/exporter";
import { EVENT_RESULTS, EVENT_TREE, EVENT_LOG, EVENT_INFO, EVENT_DEBUG } from "@zakzak/exporter/emitter";

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
			child.on("message", (msg: { events: EventMessage[], benchmark: Benchmark }) => {
				this.handleMessages(msg.events);
				zak.debug(`process with benchmark ${this.benchmark.name} finished`);
				res(msg.benchmark);
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

	private handleMessages(events: EventMessage[]) {
		for (let i = 0, l = events.length; i < l; i++) {
			const current = events[i];
			if (current.event === EVENT_RESULTS) {
				zak.results(current.args);
			} else if (current.event === EVENT_TREE) {
				zak.tree(current.args);
			} else if (current.event === EVENT_LOG) {
				zak.log(current.args);
			} else if (current.event === EVENT_INFO) {
				zak.info(current.args);
			} else if (current.event === EVENT_DEBUG) {
				zak.debug(current.args);
			}
		}
	}
}
