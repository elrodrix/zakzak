
// shebang.js will insert a shebang somewhere above this comment
// shebang hack: http://sambal.org/2014/02/passing-options-node-shebang-line/
// shebang has to be inserted after transpilation, otherwise tsc will insert semicolons between ":" and //
// which would make it no longer work
import path from "path";
import globby from "globby";
import { BenchmarkManager } from "@zakzak/manager/benchmark-manager";
import { CLIManager } from "@zakzak/cli/cli-manager";
import { OptionsManager } from "@zakzak/config/options-manager";
import { StructureManager } from "@zakzak/structure/structure-manager";
import { ExportManager } from "@zakzak/exporter/export-manager";

const cli = new CLIManager();
const paramOptions = cli.getOptions();

const options = new OptionsManager();
options.change(paramOptions);

const pattern = path.posix.join(options.benchmarkManagerOptions.path, options.benchmarkManagerOptions.pattern);
const files = globby.sync(pattern, { absolute: true });

cli.printHeader();

const structure = new StructureManager(options.benchmarkOptions);
structure.addFiles(files);

const manager = new BenchmarkManager(structure.benchmarks, options.benchmarkManagerOptions);
const results = manager.run();

const exporter = new ExportManager(options.benchmarkManagerOptions);
results.then((r) => {
	exporter.write(r);
});
