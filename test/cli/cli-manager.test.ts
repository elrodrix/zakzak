import { CLIManager, DefaultBenchmarkOptions, OptionsWrapper, DefaultBenchmarkManagerOptions } from "../../src";
import { expect } from "chai";
import * as sinon from "sinon";
import fs, { PathLike, WriteFileOptions } from "fs";
import commander from "commander";
import { cloneDeep } from "lodash";

describe("CLIManager", function () {
	describe("#constructor()", function () {
		describe("--init", function () {
			let path: string;
			let data: any;
			let exitStub: sinon.SinonStub;
			let writeFileSyncSpy: sinon.SinonSpy;

			beforeEach(function () {
				const writeFileSync = (p: PathLike | number, d: any, options?: WriteFileOptions) => {
					path = p.toString();
					data = d;
				};

				writeFileSyncSpy = sinon.fake(writeFileSync);
				sinon.replace(fs, "writeFileSync", writeFileSyncSpy);

				exitStub = sinon.stub(process, "exit");

				commander.init = true;
			});

			afterEach(function () {
				sinon.restore();
				delete commander.init;
				path = undefined;
				data = undefined;
			});

			it("should write a file", function () {
				new CLIManager();
				expect(writeFileSyncSpy.called).to.be.true;
			});

			it("should write a file to the cwd", function () {
				const cwdSpy = sinon.fake.returns("/home/user/project");
				sinon.replace(process, "cwd", cwdSpy);

				new CLIManager();

				const configPath = "/home/user/project/zakzak.config.json";

				expect(path).to.equal(configPath);
			});

			it("should write a valid json", function () {
				new CLIManager();
				const fileContent = String(data);

				expect(JSON.parse.bind(JSON, fileContent)).to.not.throw;
			});

			it("should write a config with no config property", function () {
				let options = cloneDeep({ benchmark: DefaultBenchmarkOptions, manager: DefaultBenchmarkManagerOptions } as OptionsWrapper);
				delete options.manager.config;

				new CLIManager();
				const fileContent = String(data);
				const configJson = JSON.parse(fileContent);

				expect(configJson.manager).to.deep.equal(options.manager);
			});

			it("should exit the process", function () {
				new CLIManager();
				expect(exitStub.called).to.be.true;
			});
		});
	});

	describe("#getOptions()", function () {
		describe("no-config-file", function () {
			let existsSyncSpy: sinon.SinonSpy;

			beforeEach(function () {
				existsSyncSpy = sinon.fake.returns(false);
				sinon.replace(fs, "existsSync", existsSyncSpy);
			});

			afterEach(function () {
				sinon.restore();
				delete commander.path;
				delete commander.pattern;
				delete commander.config;
				delete commander.exporter;
			});

			it("should check if the config exists", function () {
				const cm = new CLIManager();
				cm.getOptions();

				expect(existsSyncSpy.called).to.be.true;
			});

			it("should return empty options except for default config path", function () {
				const cm = new CLIManager();
				const options = cm.getOptions();

				expect(options.benchmark).to.be.empty;
				expect(options.manager).to.be.deep.equal({ config: DefaultBenchmarkManagerOptions.config });
			});

			it("should return config with values from cli params", function () {
				const manager = {
					path: "/home/user/project",
					pattern: "*.bench-this.js",
					config: "zakconfig.json",
					exporter: ["xml"]
				};

				const cm = new CLIManager();

				// set cli params
				commander.path = manager.path;
				commander.pattern = manager.pattern;
				commander.config = manager.config;
				commander.exporter = manager.exporter[0];

				const options = cm.getOptions();

				expect(options.manager).to.deep.equal(manager);
			});
		});

		describe("with-config-file", function () {
			let existsSyncSpy: sinon.SinonSpy;
			let readFileSyncSpy: sinon.SinonSpy;
			let path: string;
			let options: OptionsWrapper;

			beforeEach(function () {
				existsSyncSpy = sinon.fake.returns(true);
				readFileSyncSpy = sinon.fake((p: PathLike | number, o?: { encoding?: null; flag?: string; } | null) => {
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
						runParallel: 8
					}
				};
			});

			afterEach(function () {
				path = undefined;
				options = undefined;
				sinon.restore();
				delete commander.config;
				delete commander.path;
				delete commander.exporter;
			});

			it("should read from a file", function () {
				const cm = new CLIManager();
				cm.getOptions();

				expect(readFileSyncSpy.called).to.be.true;
			});

			it("should read the config from the default filename", function () {
				sinon.replace(process, "cwd", sinon.fake.returns("/home/user/project"))

				const cm = new CLIManager();
				cm.getOptions();


				expect(path).to.equal("/home/user/project/zakzak.config.json");
			});

			it("should read the config file from the custom filename", function () {
				sinon.replace(process, "cwd", sinon.fake.returns("/home/user/project"))

				const cm = new CLIManager();
				commander.config = "zakconfig.json";
				cm.getOptions();

				expect(path).to.equal("/home/user/project/zakconfig.json");
			});

			it("should read the config from a file", function () {
				const cm = new CLIManager();
				const o = cm.getOptions();
				const opt = cloneDeep(options);
				opt.manager.config = DefaultBenchmarkManagerOptions.config;

				expect(o).to.deep.equal(opt);
			});

			it("should overwrite the config file values with cli values", function () {
				const cm = new CLIManager();

				commander.path = "/home/me/stuff";
				commander.exporter = "console-async";
				const opt = cloneDeep(options);
				opt.manager.path = "/home/me/stuff";
				opt.manager.exporter.push("console-async");
				opt.manager.config = DefaultBenchmarkManagerOptions.config;

				const o = cm.getOptions();

				expect(o).to.deep.equal(opt);
			});
		});
	});

	describe("#printHeader()", function () {
		it("print the header to the console", function () {
			const stub = sinon.stub(console, "log");
			const cm = new CLIManager();
			cm.printHeader();

			expect(stub.called).to.be.true;
		});
	});
});