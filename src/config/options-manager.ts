import _ from "lodash";
import { CommanderStatic } from "commander";
import { DefaultBenchmarkOptions, DefaultBenchmarkManagerOptions, DefaultCLIOptions, BenchmarkOptions, BenchmarkManagerOptions, CLIOptions } from "./options";

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
			OptionsManager.cliOptions = _.merge({}, OptionsManager.cliOptions, config.cli);
		}
	}

	public static changeFromCommander(commander: CommanderStatic) {
		const cliOptions: CLIOptions = {
			verbose: commander.verbose,
			quiet: commander.quiet,
			pattern: commander.pattern,
			path: commander.path
		};
		OptionsManager.cliOptions = _.merge({}, OptionsManager.cliOptions, cliOptions);
	}

	public static overrideConsole() {
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
				oldInfo(`${new Date().toISOString()}:`, ...arguments);
			}
		};
		const oldDebug = console.debug.bind(console);
		// tslint:disable-next-line: only-arrow-functions
		console.debug = function() {
			if (OptionsManager.cliOptions.quiet === false) {
				if (OptionsManager.cliOptions.verbose === true) {
					oldDebug(`${new Date().toISOString()}:`, ...arguments);
				}
			}
		};
	}
}
