import { expect } from "chai";
import { cloneDeep } from "lodash";
import { Benchmark, DefaultBenchmarkOptions, BenchmarkOptions, TimeUnit } from "../../src";

describe("Benchmark", () => {
  const a = () => {
    Array(100000).map((_, i) => i);
  };
  let benchmark: Benchmark;

  describe("#constructor()", () => {
    it("should instantiate", () => {
      benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", {});
      expect(benchmark).to.exist;
    });

    it("should set properties", () => {
      const b = {
        id: "foobar.js:foo:bar",
        name: "bar",
        fn: a,
        filepath: "foobar.js",
        options: DefaultBenchmarkOptions,
      };
      benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", {});
      expect(benchmark).to.deep.include(b);
    });

    it("should set default values for empty object", () => {
      benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", {});
      expect(benchmark.getOptions()).to.exist.and.to.include(DefaultBenchmarkOptions);
    });

    it("should set default values for undefined or null", () => {
      benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", undefined);
      expect(benchmark.getOptions()).to.exist.and.to.include(DefaultBenchmarkOptions);

      benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", null);
      expect(benchmark.getOptions()).to.exist.and.to.include(DefaultBenchmarkOptions);
    });
  });

  describe("#start()", () => {
    let options: BenchmarkOptions;
    beforeEach(() => {
      options = cloneDeep(DefaultBenchmarkOptions);
      options.maxSamples = 50;
      options.maxTime = 500 * TimeUnit.Millisecond;
      benchmark = new Benchmark("foobar.js:foo:bar", "bar", a, "foobar.js", cloneDeep(options));
    });

    it("should run the benchmark and return results", () => {
      const result = benchmark.start();
      expect(result)
        .to.deep.include({
          id: "foobar.js:foo:bar",
          name: "bar",
          filename: "foobar.js",
          options,
        })
        .and.to.have.all.keys({
          id: "",
          name: "",
          filename: "",
          count: 1,
          options: {},
          stats: {},
          times: [],
        });
    });

    it("should not have more or less samples than specified in the options", () => {
      const result = benchmark.start();
      expect(result.times.length).to.be.within(options.minSamples, options.maxSamples);
    });
  });
});
