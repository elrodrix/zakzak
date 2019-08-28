
// shebang.js will insert a shebang somewhere above this comment
// shebang hack: http://sambal.org/2014/02/passing-options-node-shebang-line/
// shebang has to be inserted after transpilation, otherwise tsc will insert semicolons between ":" and //
// which would make it no longer work
import BenchmarkManager from "../manager/benchmark-manager";
import CLIManager from "./cli-manager";
import OptionsManager from "../config/options-manager";
import { ExportEmitter } from "../manager/exporter/emitter";
import { ExporterRepository, ConsoleExporter } from "../manager/exporter/exporter";

const cli = new CLIManager();
const files = cli.getFiles();

ExporterRepository.addExporter(new ConsoleExporter(ExportEmitter.getInstance(), OptionsManager.getOptions()));

cli.printHeader();





BenchmarkManager
	.getInstance()
	.readFiles(files)
	.run();

