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
