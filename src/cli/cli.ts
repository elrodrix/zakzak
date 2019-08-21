#!/usr/bin/env node

import commander from "commander";
import globby from "globby";
import path from "path";
import Configstore from "configstore";
import fs from "fs";

const defaultConfigPath = "./zakzak.config.json";

commander.version("0.0.1", "-v, --version");
commander
	.option("-p, --pattern <pattern>", "file pattern to match the benchmarking files", "*.bench.js")
	.option("-P, --path <path>", "path to look for files", "./")
	.option("-s, --slave", "start the process as slave process, mainly for internal use")
	.option("-b, --benchmark <id>", "id of the benchmark that the slave process will execute")
	.option("-c, --config <path>", "path to config file", defaultConfigPath);

commander.on("--help", () => {
	console.log("\nExamples:");
	console.log(" $ zakzak");
	console.log(" $ zakzak -P ./src/benchmarks");
	console.log(" $ zakzak -rP ./src -p *.zakzak-boommboom.js");
	console.log(" $ zakzak --slave -P ./src/service/cryptominer.js -b 3");
});

commander.parse(process.argv);

// Combine search path and pattern
const pattern = path.posix.join(commander.path, commander.pattern);
const files = globby.sync(pattern, { absolute: true });


const cwd = process.cwd();
let configPath: string;
if (fs.existsSync(path.posix.join(cwd, commander.config))) {
	configPath = path.posix.join(cwd, commander.config);
} else if (fs.existsSync(path.posix.join(cwd, defaultConfigPath))) {
	configPath = path.posix.join(cwd, defaultConfigPath);
} else {
	configPath = path.posix.join(__dirname, "./../../", defaultConfigPath);
}

const config = new Configstore(configPath);


structure("", () => { console.log(1); });
