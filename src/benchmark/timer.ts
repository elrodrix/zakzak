import _ from "lodash";

import {TimeUnit} from "../time";

export class Timer {
	public static getTime(unit: TimeUnit = TimeUnit.Nanosecond) {
		const time = process.hrtime();
		return (time[0] * TimeUnit.Second + time[1]) / unit;
	}

	public static getResolution() {
		let count = 50;
		const times: number[] = [];
		while (count--) {
			let now;
			const begin = Timer.getTime();
			while (!((now = Timer.getTime()) - begin)) { }
			times.push(now - begin);
		}
		return _.mean(times);
	}
}
