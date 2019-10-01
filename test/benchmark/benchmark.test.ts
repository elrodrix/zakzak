import { Benchmark, DefaultBenchmarkOptions, BenchmarkOptions, TimeUnit } from "../../src";
import { expect } from "chai";
import { cloneDeep } from "lodash";

describe("Benchmark", function () {

	const a = () => { Array(100000).map((_, i) => i); };
	let benchmark: Benchmark;

	describe("#constructor()", function () {
		it("should instantiate", function () {
			benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", {});
			expect(benchmark).to.exist;
		});

		it("should set properties", function () {
			const b = { id: "foobar.js:foo:bar", name: "bar", fn: a, filepath: "foobar.js", options: DefaultBenchmarkOptions };
			benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", {});
			expect(benchmark).to.deep.include(b);
		});

		it("should set default values for empty object", function () {
			benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", {});
			expect(benchmark.getOptions()).to.exist.and.to.include(DefaultBenchmarkOptions);
		});

		it("should set default values for undefined or null", function () {
			benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", undefined);
			expect(benchmark.getOptions()).to.exist.and.to.include(DefaultBenchmarkOptions);

			benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", null);
			expect(benchmark.getOptions()).to.exist.and.to.include(DefaultBenchmarkOptions);
		});
	});

	describe("#start()", function () {
		let options: BenchmarkOptions;
		let benchmark: Benchmark;
		this.timeout("30s");
		beforeEach(function () {
			options = cloneDeep(DefaultBenchmarkOptions);
			options.maxSamples = 50;
			options.maxTime = 500 * TimeUnit.Millisecond;
			benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", cloneDeep(options));
		});

		it("should run the benchmark and return results", function () {
			const result = benchmark.start();
			expect(result).to.deep.include({ id: "foobar.js:foo:bar", name: "bar", filename: "foobar.js", options: options })
				.and.to.have.all.keys({ id: "", name: "", filename: "", count: 1, options: {}, stats: {}, times: [] });
		});

		it("should not have more or less samples than specified in the options", function () {
			const result = benchmark.start();
			expect(result.times.length).to.be.within(options.minSamples, options.maxSamples);
		});
	});
});
