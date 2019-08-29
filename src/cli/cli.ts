
// shebang.js will insert a shebang somewhere above this comment
// shebang hack: http://sambal.org/2014/02/passing-options-node-shebang-line/
// shebang has to be inserted after transpilation, otherwise tsc will insert semicolons between ":" and //
// which would make it no longer work
import BenchmarkManager from "@zakzak/manager/benchmark-manager";
import CLIManager from "@zakzak/cli/cli-manager";
import OptionsManager from "@zakzak/config/options-manager";
import { ExporterRepository, ConsoleExporter } from "@zakzak/exporter/exporter";
import "@zakzak/logging";

zak.init();

const cli = new CLIManager();
const files = cli.getFiles();

ExporterRepository.addExporter(new ConsoleExporter(zak.get(), OptionsManager.getOptions()));

cli.printHeader();





BenchmarkManager
	.getInstance()
	.readFiles(files)
	.run();

