import Benchmark from "./../benchmark/benchmark";

export default class Structure {

	public children: Array<Benchmark | Structure>;

	public constructor(public name: string, public callback: Function, private options?: BenchmarkOptions | StructureOptions) {
		this.children = new Array();
	}

	public addChildren(...args: Array<Benchmark | Structure>) {
		this.children.push(...args);
	}
}
