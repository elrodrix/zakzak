#!/usr/bin/env node

import Commander from "commander";

Commander.version("0.0.1", "-v, --version");
Commander
	.option("-p, --pattern <pattern>", "file pattern to match the benchmarking files", "*.bench.js")
	.option("-P, --path <path>", "path to look for files", "./")
	.option("-r, --recursive", "look recursively through the target path for files")
	.option("-s, --slave", "start the process as slave process, mainly for internal use")
	.option("-b, --benchmark <id>", "id of the benchmark that the slave process will execute")
	.option("-c, --config <path>", "path to config file", "./zakzak.config.json");

Commander.on("--help", () => {
	console.log("\nExamples:");
	console.log(" $ zakzak");
	console.log(" $ zakzak -P ./src/benchmarks");
});

Commander.parse(process.argv);

if (Commander.pattern) { console.log(Commander.pattern); }
if (Commander.path) { console.log(Commander.path); }
if (Commander.recursive) { console.log("recursive"); }
