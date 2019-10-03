import { expect } from "chai";
import { cloneDeep } from "lodash";
import {
  OptionsManager,
  DefaultBenchmarkOptions,
  DefaultBenchmarkManagerOptions,
  OptionsWrapper,
} from "../../src";

describe("OptionsManager", () => {
  describe("#constructor()", () => {
    it("should have the default options", () => {
      const om = new OptionsManager();

      expect(om.benchmarkOptions).to.deep.equal(DefaultBenchmarkOptions);
      expect(om.benchmarkManagerOptions).to.deep.equal(DefaultBenchmarkManagerOptions);
    });
  });

  describe("#getOptions()", () => {
    it("should return both benchmark- and manageroptions", () => {
      const om = new OptionsManager();
      const options = om.getOptions();

      expect(options).to.deep.equal({
        benchmark: DefaultBenchmarkOptions,
        manager: DefaultBenchmarkManagerOptions,
      } as OptionsWrapper);
    });
  });

  describe("#change()", () => {
    it("should only change supplied properties", () => {
      const om = new OptionsManager();
      const bo = cloneDeep(DefaultBenchmarkOptions);
      const bmo = cloneDeep(DefaultBenchmarkManagerOptions);

      bo.maxSamples = 2;
      bmo.config = "foobar";

      om.change({ benchmark: { maxSamples: bo.maxSamples }, manager: { config: bmo.config } });

      expect(om.benchmarkOptions).to.deep.equal(bo);
      expect(om.benchmarkManagerOptions).to.deep.equal(bmo);
    });
  });
});
