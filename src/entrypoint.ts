/*!
 * Copyright 2019, Dynatrace LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from "path";
import globby from "globby";
import BenchmarkManager from "./manager";
import CLIManager from "./cli";
import { OptionsManager } from "./config";
import { SuiteManager } from "./suite";
import { ExportManager } from "./exporter";

CLIManager.init();
const paramOptions = CLIManager.getOptions();

const options = new OptionsManager();
options.change(paramOptions);

const pattern = path.posix.join(
  options.benchmarkManagerOptions.path,
  options.benchmarkManagerOptions.pattern,
);
const files = globby.sync(pattern, { absolute: true });

CLIManager.printHeader();

const exporter = new ExportManager(options.benchmarkManagerOptions);

const suite = new SuiteManager(options.benchmarkOptions);
suite.addFiles(files);

exporter.exportHierarchy(suite.files);

const manager = new BenchmarkManager(suite.benchmarks, options.benchmarkManagerOptions, exporter);
manager.run();
