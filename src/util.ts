import _ from "lodash";
import fs from "fs";
import shell from "shelljs";

/**
 * Get Optimizations stats from the status provided by v8.
 * @param status The bitmap containing the status information
 */
export function getOptimizationStats(status: number) {
	const statuses: string[] = [];
	for (const item in OptimizationStatus) {
		if (typeof item === "number") {
			const bitmask = parseInt(item, 10);
			if ((status & bitmask) === bitmask) {
				statuses.push(OptimizationStatus[bitmask]);
			}
		}

	}

	return statuses;
}

/**
 * Bitmaps for all the possible optimizition statuses
 */
export enum OptimizationStatus {
	IsFunction = 1 << 0,
	NeverOptimize = 1 << 1,
	AlwaysOptimize = 1 << 2,
	MaybeDeopted = 1 << 3,
	Optimized = 1 << 4,
	TurboFanned = 1 << 5,
	Interpreted = 1 << 6,
	MarkedForOptimization = 1 << 7,
	MarkedForConcurrentOptimization = 1 << 8,
	OptimizingConcurrently = 1 << 9,
	IsExecuting = 1 << 10,
	TopmostFrameIsTurboFanned = 1 << 11,
	LiteMode = 1 << 12
}

/**
 * Writes some data to a json file
 * @param data Data that will be written to a file
 * @param filename File to which the data will be written
 */
export function writeToJson(data: any, filename = "data.json") {
	const text = JSON.stringify(data);
	fs.writeFileSync(filename, text, "utf8");
}

/**
 * Plot the data, by writing it to a json and then using a shell script which calls a python script with pyplot
 * @param data the data that will be passed to pyplot for plotting
 */
export function plotData(data: Array<{ x: number[], y: number[], color: string }>) {
	writeToJson(data);
	shell.exec("./plot.sh");
}

/**
 * Checks if a number is withing X percent of another number
 * @param target Target value around which the number should be
 * @param value Value that gets checked if it is in range
 * @param percent Percent written in like in decimal. example: 10% = 0.1
 */
export function isWithin(target: number, value: number, percent: number) {
	return Math.abs(target - value) <= (target * percent);
}
