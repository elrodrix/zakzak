
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
const configOptions = cli.getConfigOptions();
const paramOptions = cli.getParamOptions();

const options = new OptionsManager();
options.change(configOptions);
options.change(paramOptions);

const pattern = path.posix.join(options.cliOptions.path, options.cliOptions.pattern);
const files = globby.sync(pattern, { absolute: true });

cli.printHeader();

const structure = new StructureManager(options.benchmarkOptions);
structure.addFiles(files);

const manager = new BenchmarkManager(structure.benchmarks, options.benchmarkManagerOptions);
const results = manager.run();

const exporter = new ExportManager(options.cliOptions);
(async () => { exporter.write(await results); })().catch((err) => console.error(err));
