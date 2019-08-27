import figlet from "figlet";
import chalk from "chalk";
import commander from "commander";
import path from "path";
import fs from "fs";
import globby from "globby";
import OptionsManager from "../config/options-manager";

export default class CLIManager {

	constructor() {
		this.setParams();
		this.setExample();
		this.processArgs();
		this.printHeader();
		this.loadConfig();
		this.loadParams();
	}

	public getFiles() {
		// Combine search path and pattern
		const pattern = path.posix.join(OptionsManager.cliOptions.path, OptionsManager.cliOptions.pattern);
		const files = globby.sync(pattern, { absolute: true });
		return files;
	}

	private printHeader() {
		console.log(
			chalk.greenBright(
				figlet.textSync("ZAKZAK", {
					font: "3D-ASCII"
				})
			)
		);
	}

	private setParams() {
		commander.version("0.0.1", "-v, --version");
		commander
			.option("-p, --pattern <pattern>", "file pattern to match the benchmarking files", "*.bench.js")
			.option("-P, --path <path>", "path to look for files", "./")
			.option("-V, --verbose", "enable verbose mode to output more information")
			.option("-Q, --quiet", "enable quiet mode to completely disabled console output")
			.option("-c, --config <path>", "path to config file");
	}

	private setExample() {
		commander.on("--help", () => {
			console.log("\nExamples:");
			console.log(" $ zakzak");
			console.log(" $ zakzak -P ./src/benchmarks");
			console.log(" $ zakzak -rP ./src -p *.zakzak-boommboom.js");
		});
	}

	private processArgs() {
		commander.parse(process.argv);
	}

	private loadConfig() {
		if (!!commander.config) {
			const cwd = process.cwd();
			const configPath = path.posix.join(cwd, commander.config);
			if (fs.existsSync(configPath)) {
				const config = JSON.parse(fs.readFileSync(configPath).toString());
				OptionsManager.changeFromConfigFile(config);
			}
		}
	}

	private loadParams() {
		OptionsManager.changeFromCommander(commander);
	}
}
