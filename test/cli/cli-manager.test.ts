import { expect } from "chai";
import * as sinon from "sinon";
import fs, { PathLike } from "fs";
import commander from "commander";
import { cloneDeep } from "lodash";
import {
  CLIManager,
  DefaultBenchmarkOptions,
  OptionsWrapper,
  DefaultBenchmarkManagerOptions,
} from "../../src";

describe("CLIManager", () => {
  describe("#constructor()", () => {
    describe("--init", () => {
      let path: string;
      let data: any;
      let exitStub: sinon.SinonStub<[number?], never>;
      let writeFileSyncSpy: sinon.SinonSpy;

      beforeEach(() => {
        const writeFileSync = (p: PathLike | number, d: any) => {
          path = p.toString();
          data = d;
        };

        writeFileSyncSpy = sinon.fake(writeFileSync);
        sinon.replace(fs, "writeFileSync", writeFileSyncSpy);

        exitStub = sinon.stub(process, "exit");

        commander.init = true;
      });

      afterEach(() => {
        sinon.restore();
        delete commander.init;
        path = undefined;
        data = undefined;
      });

      it("should write a file", () => {
        CLIManager.init();
        expect(writeFileSyncSpy.called).to.be.true;
      });

      it("should write a file to the cwd", () => {
        const cwdSpy = sinon.fake.returns("/home/user/project");
        sinon.replace(process, "cwd", cwdSpy);

        CLIManager.init();

        const configPath = "/home/user/project/zakzak.config.json";

        expect(path).to.equal(configPath);
      });

      it("should write a valid json", () => {
        CLIManager.init();
        const fileContent = String(data);

        expect(JSON.parse.bind(JSON, fileContent)).to.not.throw;
      });

      it("should write a config with no config property", () => {
        const options = cloneDeep({
          benchmark: DefaultBenchmarkOptions,
          manager: DefaultBenchmarkManagerOptions,
        } as OptionsWrapper);
        delete options.manager.config;

        CLIManager.init();
        const fileContent = String(data);
        const configJson = JSON.parse(fileContent);

        expect(configJson.manager).to.deep.equal(options.manager);
      });

      it("should exit the process", () => {
        CLIManager.init();
        expect(exitStub.called).to.be.true;
      });
    });
  });

  describe("#getOptions()", () => {
    describe("no-config-file", () => {
      let existsSyncSpy: sinon.SinonSpy;

      beforeEach(() => {
        existsSyncSpy = sinon.fake.returns(false);
        sinon.replace(fs, "existsSync", existsSyncSpy);
      });

      afterEach(() => {
        sinon.restore();
        delete commander.path;
        delete commander.pattern;
        delete commander.config;
        delete commander.exporter;
      });

      it("should check if the config exists", () => {
        CLIManager.init();
        CLIManager.getOptions();

        expect(existsSyncSpy.called).to.be.true;
      });

      it("should return empty options except for default config path", () => {
        CLIManager.init();
        const options = CLIManager.getOptions();

        expect(options.benchmark).to.be.empty;
        expect(options.manager).to.be.deep.equal({ config: DefaultBenchmarkManagerOptions.config });
      });

      it("should return config with values from cli params", () => {
        const manager = {
          path: "/home/user/project",
          pattern: "*.bench-this.js",
          config: "zakconfig.json",
          exporter: ["xml"],
        };

        CLIManager.init();

        // set cli params
        commander.path = manager.path;
        commander.pattern = manager.pattern;
        commander.config = manager.config;
        [commander.exporter] = manager.exporter;

        const options = CLIManager.getOptions();

        expect(options.manager).to.deep.equal(manager);
      });
    });

    describe("with-config-file", () => {
      let existsSyncSpy: sinon.SinonSpy;
      let readFileSyncSpy: sinon.SinonSpy;
      let path: string;
      let options: OptionsWrapper;

      beforeEach(() => {
        existsSyncSpy = sinon.fake.returns(true);
        readFileSyncSpy = sinon.fake((p: PathLike | number) => {
          path = p.toString();
          return JSON.stringify(options);
        });

        sinon.replace(fs, "existsSync", existsSyncSpy);
        sinon.replace(fs, "readFileSync", readFileSyncSpy);

        options = {
          benchmark: {
            maxSamples: 123123,
            minSamples: 321,
            minTime: 12,
            maxTime: 21212121,
          },
          manager: {
            exporter: ["xml", "json"],
            path: "./foo/bar",
            pattern: "*.zak.js",
            runParallel: 8,
          },
        };
      });

      afterEach(() => {
        path = undefined;
        options = undefined;
        sinon.restore();
        delete commander.config;
        delete commander.path;
        delete commander.exporter;
      });

      it("should read from a file", () => {
        CLIManager.init();
        CLIManager.getOptions();

        expect(readFileSyncSpy.called).to.be.true;
      });

      it("should read the config from the default filename", () => {
        sinon.replace(process, "cwd", sinon.fake.returns("/home/user/project"));

        CLIManager.init();
        CLIManager.getOptions();

        expect(path).to.equal("/home/user/project/zakzak.config.json");
      });

      it("should read the config file from the custom filename", () => {
        sinon.replace(process, "cwd", sinon.fake.returns("/home/user/project"));

        CLIManager.init();
        commander.config = "zakconfig.json";
        CLIManager.getOptions();

        expect(path).to.equal("/home/user/project/zakconfig.json");
      });

      it("should read the config from a file", () => {
        CLIManager.init();
        const o = CLIManager.getOptions();
        const opt = cloneDeep(options);
        opt.manager.config = DefaultBenchmarkManagerOptions.config;

        expect(o).to.deep.equal(opt);
      });

      it("should overwrite the config file values with cli values", () => {
        CLIManager.init();

        commander.path = "/home/me/stuff";
        commander.exporter = "console-async";
        const opt = cloneDeep(options);
        opt.manager.path = "/home/me/stuff";
        opt.manager.exporter.push("console-async");
        opt.manager.config = DefaultBenchmarkManagerOptions.config;

        const o = CLIManager.getOptions();

        expect(o).to.deep.equal(opt);
      });
    });
  });

  describe("#printHeader()", () => {
    after(() => {
      sinon.restore();
    });

    it("print the header to the console", () => {
      const stub = sinon.stub(console, "log");
      CLIManager.init();
      CLIManager.printHeader();

      expect(stub.called).to.be.true;
    });
  });
});
