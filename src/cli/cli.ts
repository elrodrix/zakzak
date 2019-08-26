
// shebang.js will insert a shebang somewhere above this comment
// shebang hack: http://sambal.org/2014/02/passing-options-node-shebang-line/
// shebang has to be inserted after transpilation, otherwise tsc will insert semicolons between ":" and //
// which would make it no longer work

import commander from "commander";
import globby from "globby";
import path from "path";
import Configstore from "configstore";
import figlet from "figlet";
import chalk from "chalk";
import fs from "fs";
import BenchmarkManager from "./../manager/manager";
import { ConsoleExporter, JsonExporter } from "./../manager/exporter";
const defaultConfigPath = "./zakzak.config.json";

// Print fancy header
console.log(
	chalk.greenBright(
		figlet.textSync("ZAKZAK", {
			font: "3D-ASCII"
		})
	)
);

commander.version("0.0.1", "-v, --version");
commander
	.option("-p, --pattern <pattern>", "file pattern to match the benchmarking files", "*.bench.js")
	.option("-P, --path <path>", "path to look for files", "./")
	// .option("-s, --slave", "start the process as slave process, mainly for internal use")
	.option("-b, --benchmark <id>", "id of the benchmark that the slave process will execute")
	.option("-c, --config <path>", "path to config file", defaultConfigPath);

commander.on("--help", () => {
	console.log("\nExamples:");
	console.log(" $ zakzak");
	console.log(" $ zakzak -P ./src/benchmarks");
	console.log(" $ zakzak -rP ./src -p *.zakzak-boommboom.js");
	// console.log(" $ zakzak --slave -P ./src/service/cryptominer.bench.js -b 3");
});

commander.parse(process.argv);

// Combine search path and pattern
const pattern = path.posix.join(commander.path, commander.pattern);
const files = globby.sync(pattern, { absolute: true });


// Search for config file. If none found, take default one
const cwd = process.cwd();
let configPath: string;
if (fs.existsSync(path.posix.join(cwd, commander.config))) {
	configPath = path.posix.join(cwd, commander.config);
} else if (fs.existsSync(path.posix.join(cwd, defaultConfigPath))) {
	configPath = path.posix.join(cwd, defaultConfigPath);
} else {
	configPath = path.posix.join(__dirname, "./../../", defaultConfigPath);
}

// Load config
const config = new Configstore(configPath);
const manager = BenchmarkManager
.getInstance()
.useOptions({
	exporters: [new ConsoleExporter(), new JsonExporter()],
	runParallel: false,
	printStructure: true
})
.findBenchmarks(files)
.run();
