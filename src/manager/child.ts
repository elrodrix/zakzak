import v8natives from "v8-natives";
import Benchmark from "./../benchmark/benchmark";
import BenchmarkManager from "./manager";

new Promise((res: (value: Benchmark) => void) => {
	process.on("message", (msg: Benchmark) => {
		res(msg);
	});
}).then((b) => {
	const manager = BenchmarkManager.getInstance();
	manager.findBenchmarks([b.filename]);
	const benchmark = manager.getBenchmark(b.name);
	benchmark.run();
	process.send(benchmark);
	process.exit(0);
}).catch(() => {
	process.exit(1);
});
