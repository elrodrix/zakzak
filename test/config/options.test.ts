import { expect } from "chai";
import {
  DefaultBenchmarkOptions,
  BenchmarkOptions,
  BenchmarkManagerOptions,
  DefaultBenchmarkManagerOptions,
} from "../../src";

describe("Options", () => {
  describe("DefaultBenchmarkOptions", () => {
    it("should contain values for all fields", () => {
      const options: BenchmarkOptions = {
        maxSamples: 0,
        maxTime: 0,
        minSamples: 0,
        minTime: 0,
        maxIterations: 0,
        minIterations: 0,
      };

      expect(DefaultBenchmarkOptions).to.have.all.keys(options);
    });
  });
  describe("DefaultBenchmarkManagerOptions", () => {
    it("should contain values for all fields", () => {
      const options: BenchmarkManagerOptions = {
        config: "",
        exporter: [""],
        path: "",
        pattern: "",
        runParallel: 0,
      };

      expect(DefaultBenchmarkManagerOptions).to.have.all.keys(options);
    });
  });
});
