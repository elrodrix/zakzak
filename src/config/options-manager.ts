import _ from "lodash";
import { DefaultBenchmarkOptions, DefaultBenchmarkManagerOptions, DefaultCLIOptions, OptionsWrapper } from "@zakzak/config/options";

export class OptionsManager {

	public benchmarkOptions = DefaultBenchmarkOptions;
	public benchmarkManagerOptions = DefaultBenchmarkManagerOptions;
	public cliOptions = DefaultCLIOptions;

	public change(options: OptionsWrapper) {
		this.benchmarkOptions = _.merge({}, this.benchmarkOptions, options.benchmark);
		this.benchmarkManagerOptions = _.merge({}, this.benchmarkManagerOptions, options.manager);
		this.cliOptions = _.merge({}, this.cliOptions, options.cli);
	}

	public getOptions(): OptionsWrapper {
		return {
			benchmark: this.benchmarkOptions,
			manager: this.benchmarkManagerOptions,
			cli: this.cliOptions
		};
	}
}
