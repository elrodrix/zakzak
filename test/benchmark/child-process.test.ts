import * as sinon from "sinon";
import { ChildProcessHandler } from "../../src";
import { expect } from "chai";

describe("ChildProcessHandler", function () {
	describe("#constructor()", function () {
		describe("event handlers", function () {
			let onStub: sinon.SinonStub;
			beforeEach(function () {
				onStub = sinon.stub(process, "on");
			});

			afterEach(function () {
				sinon.restore();
			});

			it("should register on message", function () {
				new ChildProcessHandler();
				const x = onStub.calledWith("message");
				expect(x).to.be.true;
			});

			it("should register on uncaughtException", function () {
				new ChildProcessHandler();
				const x = onStub.calledWith("uncaughtException");
				expect(x).to.be.true;
			});
		})
	});
});