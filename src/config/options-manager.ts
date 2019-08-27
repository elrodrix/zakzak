import _ from "lodash";
import Configstore from "configstore";
import { CommanderStatic } from "commander";
import { DefaultBenchmarkOptions, DefaultBenchmarkManagerOptions, DefaultCLIOptions, BenchmarkOptions, BenchmarkManagerOptions, CLIOptions } from "./options";

export default class OptionsManager {

	public static benchmarkOptions = DefaultBenchmarkOptions;
	public static benchmarkManagerOptions = DefaultBenchmarkManagerOptions;
	public static cliOptions = DefaultCLIOptions;

	public static change(benchmarkOptions: BenchmarkOptions, benchmarkManagerOptions: BenchmarkManagerOptions, cliOptions: CLIOptions) {
		OptionsManager.benchmarkOptions = _.merge(OptionsManager.benchmarkOptions, benchmarkOptions);
		OptionsManager.benchmarkManagerOptions = _.merge(OptionsManager.benchmarkManagerOptions, benchmarkManagerOptions);
		OptionsManager.cliOptions = _.merge(OptionsManager.cliOptions, cliOptions);
	}

	public static changeFromConfigstore(store: Configstore) {
		if (store.has("benchmark")) {
			OptionsManager.benchmarkOptions = _.merge(OptionsManager.benchmarkOptions, store.get("benchmark"));
		}
		if (store.has("manager")) {
			OptionsManager.benchmarkManagerOptions = _.merge(OptionsManager.benchmarkManagerOptions, store.get("manager"));
		}
		if (store.has("cli")) {
			OptionsManager.cliOptions = _.merge(OptionsManager.cliOptions, store.get("cli"));
		}
	}

	public static changeFromCommander(commander: CommanderStatic) {
		const cliOptions: CLIOptions = {
			verbose: commander.verbose,
			quiet: commander.quiet,
			pattern: commander.pattern,
			path: commander.path
		};
		OptionsManager.cliOptions = _.merge(OptionsManager.cliOptions, cliOptions);
	}
}
