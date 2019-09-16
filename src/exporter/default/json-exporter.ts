import { writeFileSync } from "fs";
import { Exporter } from "../exporter";
import { Suite } from "../../suite";
import { BenchmarkResult } from "../../benchmark";

export class JsonExporter extends Exporter {
	public onHierarchy(root: Suite[]): void { }
	public onResult(result: BenchmarkResult): void { }
	public onFinished(results: BenchmarkResult[]): void {
		const data = JSON.stringify(results);
		writeFileSync(`${new Date().toISOString()}.data.json`, data);
	}


}
