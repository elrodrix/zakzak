import { BenchmarkResult } from "@zakzak/benchmark/benchmark";

export abstract class Exporter {
	public abstract exportResults(results: BenchmarkResult[]): void;
}
