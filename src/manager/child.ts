import Benchmark from "@zakzak/benchmark/benchmark";
import BenchmarkManager from "@zakzak/manager/benchmark-manager";
import OptionsManager from "@zakzak/config/options-manager";
import { OptionsWrapper } from "@zakzak/config/options";
import { ExporterRepository, ConsoleExporter, ChildOutputExporter } from "@zakzak/exporter/exporter";
import "@zakzak/logging";

let exporter: ChildOutputExporter;

new Promise((res: (value: Benchmark) => void) => {
	// Wait for the initialization
	process.on("message", (msg: { benchmark: Benchmark, options: OptionsWrapper }) => {
		OptionsManager.change(msg.options.benchmark, msg.options.manager, msg.options.cli);
		exporter = new ChildOutputExporter(zak.init(), OptionsManager.getOptions());
		zak.debug("received benchmark from parent process");
		res(msg.benchmark);
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
	zak.debug("sending benchmark with results to parent");
	process.send({events: exporter.getEvents(), benchmark: benchmark});
	zak.debug("exiting process with 0");
	process.exit(0);
}).catch((err) => {
	zak.debug("caught error while trying to execute benchmark");
	process.stderr.write(JSON.stringify(err));
	process.exit(1);
});
