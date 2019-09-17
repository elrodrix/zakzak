import _ from "lodash";

import { DefaultBenchmarkOptions, DefaultBenchmarkManagerOptions, OptionsWrapper } from "./options";

/**
 * The options manager is responsible for keeping the options
 * and merging them with newly applied options
 */
export class OptionsManager {

	/**
	 * The current global benchmarkOptions
	 */
	public benchmarkOptions = DefaultBenchmarkOptions;

	/**
	 * The current benchmarkmanager options
	 */
	public benchmarkManagerOptions = DefaultBenchmarkManagerOptions;

	/**
	 * Changes the options, by merging the existing options with the new options.
	 * Fields that are left undefined, wont override values.
	 * @param options New options that will override current option values
	 */
	public change(options: OptionsWrapper) {
		this.benchmarkOptions = _.merge({}, this.benchmarkOptions, options.benchmark);
		this.benchmarkManagerOptions = _.merge({}, this.benchmarkManagerOptions, options.manager);
	}

	/**
	 * Get all options
	 */
	public getOptions(): OptionsWrapper {
		return {
			benchmark: this.benchmarkOptions,
			manager: this.benchmarkManagerOptions
		};
	}
}
