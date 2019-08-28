
// shebang.js will insert a shebang somewhere above this comment
// shebang hack: http://sambal.org/2014/02/passing-options-node-shebang-line/
// shebang has to be inserted after transpilation, otherwise tsc will insert semicolons between ":" and //
// which would make it no longer work
import BenchmarkManager from "../manager/benchmark-manager";
import CLIManager from "./cli-manager";
import { ConsoleExporter } from "../manager/exporter";
import { JsonExporter } from "../manager/exporter";
import OptionsManager from "../config/options-manager";

const cli = new CLIManager();
const files = cli.getFiles();

function overrideConsole() {
	const oldLog = console.log.bind(console);
	// tslint:disable-next-line: only-arrow-functions
	console.log = function() {
		if (OptionsManager.cliOptions.quiet === false) {
			oldLog(...arguments);
		}
	};
	const oldInfo = console.info.bind(console);
	// tslint:disable-next-line: only-arrow-functions
	console.info = function() {
		if (OptionsManager.cliOptions.quiet === false) {
			oldInfo(`${new Date().toLocaleString()}:`, ...arguments);
		}
	};
	const oldDebug = console.debug.bind(console);
	// tslint:disable-next-line: only-arrow-functions
	console.debug = function() {
		if (OptionsManager.cliOptions.quiet === false) {
			if (OptionsManager.cliOptions.verbose === true) {
				oldDebug(new Date().toLocaleString(), ...arguments);
			}
		}
	};
}
overrideConsole();
cli.printHeader();





BenchmarkManager
	.getInstance()
	.addExporter(new ConsoleExporter(), new JsonExporter())
	.readFiles(files)
	.run();

