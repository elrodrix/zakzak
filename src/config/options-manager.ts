import _ from "lodash";

import { DefaultBenchmarkOptions, DefaultBenchmarkManagerOptions, OptionsWrapper } from "./options";

export class OptionsManager {

	public benchmarkOptions = DefaultBenchmarkOptions;
	public benchmarkManagerOptions = DefaultBenchmarkManagerOptions;

	public change(options: OptionsWrapper) {
		this.benchmarkOptions = _.merge({}, this.benchmarkOptions, options.benchmark);
		this.benchmarkManagerOptions = _.merge({}, this.benchmarkManagerOptions, options.manager);
	}

	public getOptions(): OptionsWrapper {
		return {
			benchmark: this.benchmarkOptions,
			manager: this.benchmarkManagerOptions
		};
	}
}
