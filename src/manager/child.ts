import Benchmark from "./../benchmark/benchmark";
import BenchmarkManager from "./benchmark-manager";
import OptionsManager from "../config/options-manager";
import { OptionsWrapper } from "../config/options";
import { ExportEmitter } from "./exporter/emitter";
import { ExporterRepository, ConsoleExporter } from "./exporter/exporter";

const em = ExportEmitter.getInstance();

new Promise((res: (value: Benchmark) => void) => {
	// Wait for the initialization
	process.on("message", (msg: { benchmark: Benchmark, options: OptionsWrapper }) => {
		OptionsManager.change(msg.options.benchmark, msg.options.manager, msg.options.cli);
		ExporterRepository.addExporter(new ConsoleExporter(em, OptionsManager.getOptions()));
		em.debug("received benchmark from parent process");
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
	em.debug("sending benchmark with results to parent");
	process.send(benchmark);
	em.debug("exiting process with 0");
	process.exit(0);
}).catch((err) => {
	em.debug("caught error while trying to execute benchmark");
	process.stderr.write(JSON.stringify(err));
	process.exit(1);
});
