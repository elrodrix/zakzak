import ChildProcess from "child_process";
import Benchmark from "../benchmark/benchmark";
import path from "path";

export default class BenchmarkProcess {

	constructor(private benchmark: Benchmark) { }

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
