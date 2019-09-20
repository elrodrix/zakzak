#!/usr/bin/env node

import path from "path";
import globby from "globby";
import { BenchmarkManager } from "./manager";
import { CLIManager } from "./cli";
import { OptionsManager } from "./config";
import { SuiteManager } from "./suite";
import { ExportManager } from "./exporter";

const cli = new CLIManager();
const paramOptions = cli.getOptions();

const options = new OptionsManager();
options.change(paramOptions);

const pattern = path.posix.join(options.benchmarkManagerOptions.path, options.benchmarkManagerOptions.pattern);
const files = globby.sync(pattern, { absolute: true });

cli.printHeader();

const exporter = new ExportManager(options.benchmarkManagerOptions);

const suite = new SuiteManager(options.benchmarkOptions);
suite.addFiles(files);

exporter.exportHierarchy(suite.files);

const manager = new BenchmarkManager(suite.benchmarks, options.benchmarkManagerOptions, exporter);
manager.run();
