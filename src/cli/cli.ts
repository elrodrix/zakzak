
// shebang.js will insert a shebang somewhere above this comment
// shebang hack: http://sambal.org/2014/02/passing-options-node-shebang-line/
// shebang has to be inserted after transpilation, otherwise tsc will insert semicolons between ":" and //
// which would make it no longer work
import BenchmarkManager from "@zakzak/manager/benchmark-manager";
import CLIManager from "@zakzak/cli/cli-manager";
import OptionsManager from "@zakzak/config/options-manager";
import { ExporterRepository, ConsoleExporter } from "@zakzak/exporter/exporter";
import "@zakzak/logging";



const cli = new CLIManager();
const files = cli.getFiles();
if (OptionsManager.definesCustomExporter()) {
	ExporterRepository.addFromFile(OptionsManager.cliOptions.exporter);
}

cli.printHeader();





BenchmarkManager
	.getInstance()
	.readFiles(files)
	.run();

