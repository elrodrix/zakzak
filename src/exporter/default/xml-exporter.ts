import { writeFileSync } from "fs";
import { js2xml } from "xml-js";
import { Exporter } from "../exporter";
import { Suite } from "../../suite";
import { BenchmarkResult } from "../../benchmark";

export class XmlExporter extends Exporter {
	public onHierarchy(root: Suite[]): void { }
	public onResult(result: BenchmarkResult): void { }
	public onFinished(results: BenchmarkResult[]): void {
		// Dont remove compact statement
		// https://github.com/nashwaan/xml-js/issues/60
		const xmlString = js2xml(results, { compact: true });
		writeFileSync(`${new Date().toISOString()}.data.xml`, xmlString);
	}
}
