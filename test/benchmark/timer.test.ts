import { expect } from "chai";
import * as sinon from "sinon";
import { Timer, TimeUnit } from "../../src";

describe("Timer", function () {
	afterEach(function () {
		sinon.restore();
	})
	describe("#getResolution()", function () {
		it("should return a number bigger than zero", function () {
			const res = Timer.getResolution();

			expect(res).to.be.above(0);
		});
		it("should use process.hrtime", function () {
			const spy = sinon.spy(process, "hrtime");
			Timer.getResolution();

			expect(spy.called).to.be.true;
		});
	});

	describe("#getTime()", function () {
		it("should use process.hrtime", function () {
			const spy = sinon.spy(process, "hrtime");
			Timer.getTime();

			expect(spy.called).to.be.true;
		});

		describe("unit-conversion", function () {
			describe("only-nanoseconds", function () {
				beforeEach(function () {
					const stubTime = [0, 463782736];
					const stub = ((time?: [number, number]) => { return stubTime }) as any;
					sinon.replace(process, "hrtime", stub);
				});

				it("should return using the time in nanoseconds", function () {
					// Test default param
					let time = Timer.getTime();
					expect(time).to.be.closeTo(463782736, 1e-9);

					time = Timer.getTime(TimeUnit.Nanosecond);
					expect(time).to.be.closeTo(463782736, 1e-9);
				});

				it("should return using the time in microseconds", function () {
					let time = Timer.getTime(TimeUnit.Microsecond);
					expect(time).to.be.closeTo(463782.736, 1e-9);
				});

				it("should return using the time in milliseconds", function () {
					let time = Timer.getTime(TimeUnit.Millisecond);
					expect(time).to.be.closeTo(463.782736, 1e-9);
				});

				it("should return using the time in seconds", function () {
					let time = Timer.getTime(TimeUnit.Second);
					expect(time).to.be.closeTo(0.463782736, 1e-9);
				});

				it("should return using the time in minutes", function () {
					let time = Timer.getTime(TimeUnit.Minute);
					expect(time).to.be.closeTo(0.463782736 / 60, 1e-9);
				});

				it("should return using the time in hours", function () {
					let time = Timer.getTime(TimeUnit.Hour);
					expect(time).to.be.closeTo(0.463782736 / 3600, 1e-9);
				});
			});

			describe("with-seconds", function () {
				beforeEach(function () {
					const stubTime = [12, 463782736];
					const stub = ((time?: [number, number]) => { return stubTime }) as any;
					sinon.replace(process, "hrtime", stub);
				});

				it("should return using the time in nanoseconds", function () {
					// Test default param
					let time = Timer.getTime();
					expect(time).to.be.closeTo((12 * 1e9) + 463782736, 1e-9);

					time = Timer.getTime(TimeUnit.Nanosecond);
					expect(time).to.be.closeTo((12 * 1e9) + 463782736, 1e-9);
				});

				it("should return using the time in microseconds", function () {
					let time = Timer.getTime(TimeUnit.Microsecond);
					expect(time).to.be.closeTo((12 * 1e6) + 463782.736, 1e-9);
				});

				it("should return using the time in milliseconds", function () {
					let time = Timer.getTime(TimeUnit.Millisecond);
					expect(time).to.be.closeTo((12 * 1e3) + 463.782736, 1e-9);
				});

				it("should return using the time in seconds", function () {
					let time = Timer.getTime(TimeUnit.Second);
					expect(time).to.be.closeTo(12 + 0.463782736, 1e-9);
				});

				it("should return using the time in minutes", function () {
					let time = Timer.getTime(TimeUnit.Minute);
					expect(time).to.be.closeTo((12 + 0.463782736) / 60, 1e-9);
				});

				it("should return using the time in hours", function () {
					let time = Timer.getTime(TimeUnit.Hour);
					expect(time).to.be.closeTo((12 + 0.463782736) / 3600, 1e-9);
				});
			});
		});
	})
});