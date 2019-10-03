import { expect } from "chai";
import { Analytics } from "../../src";

describe("Analytics", () => {
  describe(".reduceUncertainty()", () => {
    let smallestMeasure: number;
    let fraction: number;
    let result: number;

    it("should return the correct uncertainty", () => {
      smallestMeasure = 20;
      fraction = 0.05;
      result = Analytics.reduceUncertainty(smallestMeasure, fraction);
      expect(result).to.equal(smallestMeasure / 2 / fraction);

      smallestMeasure = 10000;
      fraction = 0.001;
      result = Analytics.reduceUncertainty(smallestMeasure, fraction);
      expect(result).to.equal(smallestMeasure / 2 / fraction);

      smallestMeasure = 30;
      fraction = 0.9;
      result = Analytics.reduceUncertainty(smallestMeasure, fraction);
      expect(result).to.equal(smallestMeasure / 2 / fraction);
    });

    it("should return 0", () => {
      smallestMeasure = 0;
      fraction = 0.05;
      result = Analytics.reduceUncertainty(smallestMeasure, fraction);
      expect(result).to.equal(0);
    });

    it("should return Infinity", () => {
      smallestMeasure = 20;
      fraction = 0;
      result = Analytics.reduceUncertainty(smallestMeasure, fraction);
      expect(result).to.equal(Infinity);
    });
  });

  describe(".getFullAnalysis()", () => {
    it("should return a full analysis", () => {
      const samples = Array(1000)
        .fill(1)
        .map((v, i) => (Math.sin(i) * Math.tan(i)) ** 2);
      const results = Analytics.getFullAnalysis(samples);

      expect(results).to.have.all.keys({
        min: 0,
        max: 0,
        marginOfError: 0,
        standardDeviation: 0,
        standardError: 0,
        mean: 0,
        mode: 0,
        median: 0,
      });
    });
  });

  describe(".getMin()", () => {
    it("should return the smallest number", () => {
      const samples = [123, 2123, 3456, 123456457, 234234, 14523, 12412, 3223, 152124, 2512, 11];
      const min = Analytics.getMin(samples);

      expect(min).to.equal(11);
    });
  });

  describe(".getMax()", () => {
    it("should return the biggest number", () => {
      const samples = [123, 2123, 3456, 123456457, 234234, 14523, 12412, 3223, 152124, 2512, 11];
      const max = Analytics.getMax(samples);

      expect(max).to.equal(123456457);
    });
  });

  describe(".getMean()", () => {
    it("should return the average of the numbers", () => {
      const samples = [3, 2, 3, 4, 6, 8, 1, 1, 1, 1];
      const result = Analytics.getMean(samples);

      expect(result).to.equal(3);
    });
  });

  describe(".getMode()", () => {
    it("should return the most common number", () => {
      const samples = [1, 1, 4, 3, 10, 24, 11, 10, 34, 16, 2, 56, 10, 30, 2, 40];
      const result = Analytics.getMode(samples);

      expect(result).to.equal(10);
    });

    it("should round the numbers and return the most common one", () => {
      const samples = [1.12, 2.8, 7.4, 0.9, 3.4, 1.33, 2.43, 2.5, 3.11];
      const result = Analytics.getMode(samples);

      expect(result).to.equal(3);
    });
  });

  describe(".getMedian()", () => {
    it("should return the number in the middle of the ordered array", () => {
      const samples = [1, 1, 4, 3, 10, 24, 34, 16, 2, 56, 30];
      const result = Analytics.getMedian(samples);

      expect(result).to.equal(10);
    });

    it("should return the average of the two numbers in the middle of the ordered array", () => {
      const samples = [1, 1, 4, 3, 10, 24, 34, 16, 2, 56, 30, 40];
      const result = Analytics.getMedian(samples);

      expect(result).to.equal(13);
    });
  });
});
