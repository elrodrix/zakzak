import _ from "lodash";
import path from "path";
import { CommanderStatic } from "commander";
import { DefaultBenchmarkOptions, DefaultBenchmarkManagerOptions, DefaultCLIOptions, BenchmarkOptions, BenchmarkManagerOptions, CLIOptions, OptionsWrapper } from "@zakzak/config/options";

export default class OptionsManager {

	public static benchmarkOptions = DefaultBenchmarkOptions;
	public static benchmarkManagerOptions = DefaultBenchmarkManagerOptions;
	public static cliOptions = DefaultCLIOptions;

	public static change(benchmarkOptions: BenchmarkOptions, benchmarkManagerOptions: BenchmarkManagerOptions, cliOptions: CLIOptions) {
		OptionsManager.benchmarkOptions = _.merge({}, OptionsManager.benchmarkOptions, benchmarkOptions);
		OptionsManager.benchmarkManagerOptions = _.merge({}, OptionsManager.benchmarkManagerOptions, benchmarkManagerOptions);
		OptionsManager.cliOptions = _.merge({}, OptionsManager.cliOptions, cliOptions);
	}

	public static changeFromConfigFile(config: { benchmark?: BenchmarkOptions, manager?: BenchmarkManagerOptions, cli?: CLIOptions }) {
		if (config.benchmark) {
			OptionsManager.benchmarkOptions = _.merge({}, OptionsManager.benchmarkOptions, config.benchmark);
		}
		if (config.manager) {
			OptionsManager.benchmarkManagerOptions = _.merge({}, OptionsManager.benchmarkManagerOptions, config.manager);
		}
		if (config.cli) {
			if (config.cli.exporter !== "" && config.cli.exporter != null) {
				config.cli.exporter = path.resolve(path.posix.join(process.cwd(), config.cli.exporter));
			}
			OptionsManager.cliOptions = _.merge({}, OptionsManager.cliOptions, config.cli);
		}
	}

	public static getOptions(): OptionsWrapper {
		return {
			benchmark: OptionsManager.benchmarkOptions,
			manager: OptionsManager.benchmarkManagerOptions,
			cli: OptionsManager.cliOptions
		};
	}

	public static changeFromCommander(commander: CommanderStatic) {
		const cliOptions: CLIOptions = {
			verbose: commander.verbose,
			quiet: commander.quiet,
			pattern: commander.pattern,
			path: commander.path,
			exporter: commander.exporter
		};

		if (cliOptions.exporter !== "" && cliOptions.exporter != null) {
			cliOptions.exporter = path.resolve(path.posix.join(process.cwd(), cliOptions.exporter));
		}

		OptionsManager.cliOptions = _.merge({}, OptionsManager.cliOptions, cliOptions);
	}

	public static definesCustomExporter() {
		return OptionsManager.cliOptions.exporter !== "";
	}
}
