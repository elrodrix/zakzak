import v8natives from "v8-natives";
import Benchmark from "./../benchmark/benchmark";
import BenchmarkManager from "./benchmark-manager";

new Promise((res: (value: Benchmark) => void) => {
	// Wait for the initialization
	process.on("message", (msg: Benchmark) => {
		res(msg);
	});
}).then((b) => {
	// Get the actual benchmark function
	const manager = BenchmarkManager.getInstance();
	manager.readFiles([b.filename]);
	const benchmark = manager.findBenchmark(b);
	benchmark.options = b.options;
	// Do the benchmarking
	benchmark.run();
	// Return results to parent process
	process.send(benchmark);
	process.exit(0);
}).catch((err) => {
	process.stderr.write(JSON.stringify(err));
	process.exit(1);
});
