import * as sinon from "sinon";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { ForkOptions } from "child_process";
import ChildProcess from "child_process";
import { cloneDeep } from "lodash";
import { BenchmarkProcess, DefaultBenchmarkOptions, StartMessage } from "../../src";
import { EventEmitter } from "events";

use(chaiAsPromised);

describe("BenchmarkProcess", function () {
	describe("#run()", function () {
		let forkSpy: sinon.SinonSpy;
		let output: EventEmitter;
		let childMessage: StartMessage;
		let bm: BenchmarkProcess;

		beforeEach(function () {
			forkSpy = sinon.fake((modulePath: string, args?: ReadonlyArray<string>, options?: ForkOptions) => {
				output = new EventEmitter();
				return {
					on: output.on,
					send: (msg: any) => { childMessage = msg; }
				} as any;
			});

			sinon.replace(ChildProcess, "fork", forkSpy);

			bm = new BenchmarkProcess("foo.js:bar", "foo.js", cloneDeep(DefaultBenchmarkOptions));
		});

		afterEach(function () {
			sinon.restore();
			output = undefined;
			childMessage = undefined;
			bm = undefined;
		});

		it("should fork a child process", function () {
			bm.run();
			expect(forkSpy.called).to.be.true;
		});

		describe("exit code 0", function () {
			it("should be fulfilled on exit code 0", function () {
				const p = bm.run();
				output.emit("exit", 0);
				expect(p).to.be.fulfilled;
			});

			it("should return a message with result", function () {
				const p = bm.run();
				output.emit("exit", 0);
				output.emit("message", { result: "test" });
				expect(p).to.eventually.equal({ result: "test" });
			});
		});

		describe("exit code not 0", function () {
			it("should reject on non zero exit code", function () {
				const p = bm.run();
				output.emit("exit", 1);
				expect(p).to.be.rejected;
			});

			it("should return a message with error", function () {
				const p = bm.run();
				output.emit("exit", 0);
				output.emit("message", { error: "test" });
				expect(p).to.eventually.equal({ error: "test" });
			});
		});

		it("should send a startmessage to the child process", function () {
			bm.run();
			expect(childMessage).to.deep.equal({ benchmarkID: "foo.js:bar", filename: "foo.js", options: cloneDeep(DefaultBenchmarkOptions)});
		});
	});
});