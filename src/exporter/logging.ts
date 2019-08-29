import { ExportEmitter } from "@zakzak/exporter/emitter";
import Benchmark from "@zakzak/benchmark/benchmark";
import Structure from "@zakzak/manager/structure";

export { };


declare global {
	const zak: {
		log: (message: any, ...optionalParams: any[]) => void;
		info: (message: any, ...optionalParams: any[]) => void;
		debug: (message: any, ...optionalParams: any[]) => void;
		results: (results: Benchmark[]) => void;
		tree: (roots: Structure[]) => void;
		init: () => ExportEmitter;
		get: () => ExportEmitter;
	};
}

class Zak {
	public log(message: any, ...optionalParams: any[]) {
		this.em.log(message, ...optionalParams);
	}
	public info(message: any, ...optionalParams: any[]) {
		this.em.info(message, ...optionalParams);
	}
	public debug(message: any, ...optionalParams: any[]) {
		this.em.debug(message, ...optionalParams);
	}
	public results(results: Benchmark[]) {
		this.em.exportResults(results);
	}
	public tree(roots: Structure[]) {
		this.em.printTree(roots);
	}
	public init(): ExportEmitter {
		this.em = new ExportEmitter();
		return this.em;
	}
	public get(): ExportEmitter {
		return this.em;
	}
	private em: ExportEmitter;
}

// tslint:disable-next-line: variable-name
const _global = global as any;
_global.zak = new Zak();
