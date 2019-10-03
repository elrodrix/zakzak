import { expect } from "chai";
import * as sinon from "sinon";
import { Timer, TimeUnit } from "../../src";

describe("Timer", () => {
  afterEach(() => {
    sinon.restore();
  });
  describe("#getResolution()", () => {
    it("should return a number bigger than zero", () => {
      const res = Timer.getResolution();

      expect(res).to.be.above(0);
    });
    it("should use process.hrtime", () => {
      const spy = sinon.spy(process, "hrtime");
      Timer.getResolution();

      expect(spy.called).to.be.true;
    });
  });

  describe("#getTime()", () => {
    it("should use process.hrtime", () => {
      const spy = sinon.spy(process, "hrtime");
      Timer.getTime();

      expect(spy.called).to.be.true;
    });

    describe("unit-conversion", () => {
      describe("only-nanoseconds", () => {
        beforeEach(() => {
          const stubTime = [0, 463782736];
          const stub = (() => {
            return stubTime;
          }) as any;
          sinon.replace(process, "hrtime", stub);
        });

        it("should return using the time in nanoseconds", () => {
          // Test default param
          let time = Timer.getTime();
          expect(time).to.be.closeTo(463782736, 1e-9);

          time = Timer.getTime(TimeUnit.Nanosecond);
          expect(time).to.be.closeTo(463782736, 1e-9);
        });

        it("should return using the time in microseconds", () => {
          const time = Timer.getTime(TimeUnit.Microsecond);
          expect(time).to.be.closeTo(463782.736, 1e-9);
        });

        it("should return using the time in milliseconds", () => {
          const time = Timer.getTime(TimeUnit.Millisecond);
          expect(time).to.be.closeTo(463.782736, 1e-9);
        });

        it("should return using the time in seconds", () => {
          const time = Timer.getTime(TimeUnit.Second);
          expect(time).to.be.closeTo(0.463782736, 1e-9);
        });

        it("should return using the time in minutes", () => {
          const time = Timer.getTime(TimeUnit.Minute);
          expect(time).to.be.closeTo(0.463782736 / 60, 1e-9);
        });

        it("should return using the time in hours", () => {
          const time = Timer.getTime(TimeUnit.Hour);
          expect(time).to.be.closeTo(0.463782736 / 3600, 1e-9);
        });
      });

      describe("with-seconds", () => {
        beforeEach(() => {
          const stubTime = [12, 463782736];
          const stub = (() => {
            return stubTime;
          }) as any;
          sinon.replace(process, "hrtime", stub);
        });

        it("should return using the time in nanoseconds", () => {
          // Test default param
          let time = Timer.getTime();
          expect(time).to.be.closeTo(12 * 1e9 + 463782736, 1e-9);

          time = Timer.getTime(TimeUnit.Nanosecond);
          expect(time).to.be.closeTo(12 * 1e9 + 463782736, 1e-9);
        });

        it("should return using the time in microseconds", () => {
          const time = Timer.getTime(TimeUnit.Microsecond);
          expect(time).to.be.closeTo(12 * 1e6 + 463782.736, 1e-9);
        });

        it("should return using the time in milliseconds", () => {
          const time = Timer.getTime(TimeUnit.Millisecond);
          expect(time).to.be.closeTo(12 * 1e3 + 463.782736, 1e-9);
        });

        it("should return using the time in seconds", () => {
          const time = Timer.getTime(TimeUnit.Second);
          expect(time).to.be.closeTo(12 + 0.463782736, 1e-9);
        });

        it("should return using the time in minutes", () => {
          const time = Timer.getTime(TimeUnit.Minute);
          expect(time).to.be.closeTo((12 + 0.463782736) / 60, 1e-9);
        });

        it("should return using the time in hours", () => {
          const time = Timer.getTime(TimeUnit.Hour);
          expect(time).to.be.closeTo((12 + 0.463782736) / 3600, 1e-9);
        });
      });
    });
  });
});
