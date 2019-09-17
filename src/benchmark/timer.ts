import _ from "lodash";

import {TimeUnit} from "../time";

/**
 * Timer that will be used by the benchmark
 */
export class Timer {
	/**
	 * Gets the current time using the high resolution timer from node, `process.hrtime()`.
	 * @param unit Unit in which to return the time. Default is nanosecond
	 */
	public static getTime(unit: TimeUnit = TimeUnit.Nanosecond) {
		const time = process.hrtime();
		return (time[0] * TimeUnit.Second + time[1]) / unit;
	}

	/**
	 * Calculate the resolution of the timer.
	 * The resolution is the smallest possible measurement that the timer can take.
	 */
	public static getResolution() {
		let count = 50;
		const times: number[] = [];
		while (count--) {
			let now;

			// subtract current time from a fixed time taken beforehand, until the difference is no longer 0
			const begin = Timer.getTime();
			while (!((now = Timer.getTime()) - begin)) { }

			times.push(now - begin);
		}
		return _.mean(times);
	}
}
