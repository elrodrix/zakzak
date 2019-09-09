import figlet from "figlet";
import chalk from "chalk";
import commander from "commander";
import path from "path";
import fs from "fs";
import { CLIOptions, OptionsWrapper, DefaultCLIOptions } from "@zakzak/config/options";

export class CLIManager {

	constructor() {
		this.setParams();
		this.setExample();
		this.processArgs();
	}

	public getConfigOptions(): OptionsWrapper {
		if (!!commander.config) {
			const cwd = process.cwd();
			const c = commander.config;
			const configPath = path.posix.join(cwd, c);
			if (fs.existsSync(configPath)) {
				const config: OptionsWrapper = JSON.parse(fs.readFileSync(configPath).toString());
				return config;
			}
		}
		return { benchmark: {}, cli: {}, manager: {} };
	}

	public getParamOptions(): OptionsWrapper {
		const cliOptions: CLIOptions = {
			verbose: commander.verbose,
			quiet: commander.quiet,
			pattern: commander.pattern === DefaultCLIOptions.pattern ? undefined : commander.pattern,
			path: commander.path === DefaultCLIOptions.path ? undefined : commander.path,
			exporter: commander.exporter
		};
		return { benchmark: {}, cli: cliOptions, manager: {} };
	}

	public printHeader() {
		console.log(
			chalk.greenBright(
				figlet.textSync("ZAKZAK", {
					font: "3D-ASCII"
				})
			));
	}

	private setParams() {
		commander.version("0.0.1", "-v, --version");
		commander
			.option("-p, --pattern <pattern>", "file pattern to match the benchmarking files")
			.option("-P, --path <path>", "path to look for files")
			.option("-V, --verbose", "enable verbose mode to output more information")
			.option("-Q, --quiet", "enable quiet mode to completely disabled console output")
			.option("-c, --config <path>", "path to config file")
			.option("-e --exporter <path>", "path to custom exporter");
	}

	private setExample() {
		commander.on("--help", () => {
			console.log("\nExamples:");
			console.log(" $ zakzak");
			console.log(" $ zakzak -P ./src/benchmarks");
			console.log(" $ zakzak -P ./src -p *.zakzak-boommboom.js");
			console.log(" $ zakzak -p *.benchmark-this.js -e serial-exporter.js");
		});
	}

	private processArgs() {
		commander.parse(process.argv);
	}
}
