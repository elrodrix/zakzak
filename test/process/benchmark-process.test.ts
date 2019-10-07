import * as sinon from "sinon";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import ChildProcess from "child_process";
import { cloneDeep } from "lodash";
import { EventEmitter } from "events";
import { BenchmarkProcess, DefaultBenchmarkOptions, StartMessage } from "../../src";

use(chaiAsPromised);

describe("BenchmarkProcess", () => {
  describe("#run()", () => {
    let forkSpy: sinon.SinonSpy;
    let output: EventEmitter;
    let childMessage: StartMessage;
    let bm: BenchmarkProcess;

    beforeEach(() => {
      forkSpy = sinon.fake(() => {
        output = new EventEmitter();
        return {
          on: output.on,
          send: (msg: StartMessage) => {
            childMessage = msg;
          },
        };
      });

      sinon.replace(ChildProcess, "fork", forkSpy);

      bm = new BenchmarkProcess("foo.js:bar", "foo.js", cloneDeep(DefaultBenchmarkOptions));
    });

    afterEach(() => {
      sinon.restore();
      output = undefined;
      childMessage = undefined;
      bm = undefined;
    });

    it("should fork a child process", () => {
      bm.run();
      expect(forkSpy.called).to.be.true;
    });

    describe("exit code 0", () => {
      it("should be fulfilled on exit code 0", () => {
        const p = bm.run();
        output.emit("exit", 0);
        expect(p).to.be.fulfilled;
      });

      it("should return a message with result", () => {
        const p = bm.run();
        output.emit("exit", 0);
        output.emit("message", { result: "test" });
        expect(p).to.eventually.equal({ result: "test" });
      });
    });

    describe("exit code not 0", () => {
      it("should reject on non zero exit code", () => {
        const p = bm.run();
        output.emit("exit", 1);
        expect(p).to.be.rejected;
      });

      it("should return a message with error", () => {
        const p = bm.run();
        output.emit("exit", 0);
        output.emit("message", { error: "test" });
        expect(p).to.eventually.equal({ error: "test" });
      });
    });

    it("should send a startmessage to the child process", () => {
      bm.run();
      expect(childMessage).to.deep.equal({
        benchmarkID: "foo.js:bar",
        filename: "foo.js",
        options: cloneDeep(DefaultBenchmarkOptions),
      });
    });
  });
});
