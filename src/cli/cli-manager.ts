import figlet from "figlet";
import chalk from "chalk";
import commander from "commander";
import path from "path";
import fs from "fs";
import _ from "lodash";
import { OptionsWrapper, BenchmarkManagerOptions, DefaultBenchmarkManagerOptions, DefaultBenchmarkOptions } from "@zakzak/config/options";
import { BenchmarkManager } from "@zakzak/manager/benchmark-manager";

export class CLIManager {

	constructor() {
		this.setParams();
		this.setExample();
		this.processArgs();
	}

	public getOptions(): OptionsWrapper {
		const paramOptions: BenchmarkManagerOptions = {
			pattern: commander.pattern,
			path: commander.path,
			exporter: commander.exporter ? [commander.exporter] : [],
			config: commander.config
		};

		if (this.configExists(paramOptions.config)) {
			const config = this.readConfig(paramOptions.config);
			_.mergeWith(config.manager, paramOptions, (target, source) => {
				if (_.isArray(target)) {
					return target.concat(source);
				}
			});

			return config;
		}

		return { manager: paramOptions, benchmark: {} };
	}

	public printHeader() {
		console.log(
			chalk.greenBright(
				figlet.textSync("ZAKZAK", {
					font: "3D-ASCII"
				})
			));
	}

	private configExists(configString: string) {
		const configPath = path.posix.join(process.cwd(), configString);
		return fs.existsSync(configPath);
	}

	private readConfig(configString: string) {
		const configPath = path.posix.join(process.cwd(), configString);
		const config: OptionsWrapper = JSON.parse(fs.readFileSync(configPath).toString());
		return config;
	}

	private setParams() {
		commander.version("0.0.1", "-v, --version");
		commander
			.option("-p, --pattern <pattern>", "file pattern to match the benchmarking files")
			.option("-P, --path <path>", "path to look for files")
			.option("-c, --config <path>", "path to config file", "zakzak.config.json")
			.option("-e --exporter <path>", "path to custom exporter")
			.option("--init", "copies a zakzak config to the current directory");
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
		if (commander.init) {
			const configJson: OptionsWrapper = {
				benchmark: DefaultBenchmarkOptions,
				manager: DefaultBenchmarkManagerOptions
			};
			const configString = JSON.stringify(configJson);
			fs.writeFileSync(path.posix.join(process.cwd(), DefaultBenchmarkManagerOptions.config), configString);
			process.exit(0);
		}
	}
}
