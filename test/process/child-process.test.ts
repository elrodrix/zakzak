import * as sinon from "sinon";
import { expect } from "chai";
import { ChildProcessHandler } from "../../src";

describe("ChildProcessHandler", () => {
  describe("#constructor()", () => {
    describe("event handlers", () => {
      let onStub: sinon.SinonStub;
      beforeEach(() => {
        // has to be cast, otherwise error due to typescript
        onStub = sinon.stub(process as any, "on");
      });

      afterEach(() => {
        sinon.restore();
      });

      it("should register on message", () => {
        const cp = new ChildProcessHandler();
        cp.registerEventHandlers();
        const x = onStub.calledWith("message");
        expect(x).to.be.true;
      });
    });
  });
});
