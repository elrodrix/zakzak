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

import figlet from "figlet";
import chalk from "chalk";
import commander from "commander";
import path from "path";
import fs from "fs";
import _ from "lodash";

import {
  OptionsWrapper,
  BenchmarkManagerOptions,
  DefaultBenchmarkManagerOptions,
  DefaultBenchmarkOptions,
} from "../config";

/**
 * Manager for all cli related things
 */
export default class CLIManager {
  /**
   * Sets the possible params and messages shown when using `--help`.
   * Also parses the passed arguments
   */
  public static init() {
    CLIManager.setParams();
    CLIManager.setExample();
    CLIManager.processArgs();
  }

  /**
   * Get options by combining the params passed to the cli with a config, if one is found
   */
  public static getOptions(): OptionsWrapper {
    const paramOptions: BenchmarkManagerOptions = {};
    if (commander.path) {
      paramOptions.path = commander.path;
    }
    if (commander.pattern) {
      paramOptions.pattern = commander.pattern;
    }
    if (commander.config) {
      paramOptions.config = commander.config;
    }
    if (commander.exporter) {
      paramOptions.exporter = [commander.exporter];
    }

    if (CLIManager.configExists(paramOptions.config)) {
      const config = CLIManager.readConfig(paramOptions.config);
      config.manager = _.mergeWith({}, config.manager, paramOptions, (target, source) => {
        if (_.isArray(target)) {
          return target.concat(source);
        }
        return source === undefined ? target : source;
      });

      return config;
    }

    return { manager: paramOptions, benchmark: {} };
  }

  /**
   * Print the ASCII header
   */
  public static printHeader() {
    console.log(
      chalk.greenBright(
        figlet.textSync("ZAKZAK", {
          font: "3D-ASCII",
        }),
      ),
    );
  }

  /**
   * Check if a config file exist at the specified location
   * @param configString Name of the config file
   */
  private static configExists(configString: string) {
    const configPath = path.posix.join(process.cwd(), configString);
    return fs.existsSync(configPath);
  }

  /**
   * Read the config from the file
   * @param configString Name of the config file
   */
  private static readConfig(configString: string) {
    const configPath = path.posix.join(process.cwd(), configString);
    const config: OptionsWrapper = JSON.parse(fs.readFileSync(configPath).toString());
    return config;
  }

  /**
   * Set the possible params for the cli
   */
  private static setParams() {
    commander.version("0.0.1", "-v, --version");
    commander
      .option("-p, --pattern <pattern>", "file pattern to match the benchmarking files")
      .option("-P, --path <path>", "path to look for files")
      .option("-c, --config <path>", "path to config file", "zakzak.config.json")
      .option("-e --exporter <path>", "path to custom exporter")
      .option("--init", "copies a zakzak config to the current directory");
  }

  /**
   * Set the examples that will be shown when `--help` is used
   */
  private static setExample() {
    commander.on("--help", () => {
      console.log("\nExamples:");
      console.log(" $ zakzak");
      console.log(" $ zakzak -P ./src/benchmarks");
      console.log(" $ zakzak -P ./src -p *.zakzak-boommboom.js");
      console.log(" $ zakzak -p *.benchmark-this.js -e serial-exporter.js");
    });
  }

  /**
   * Process the args passed to the cli
   */
  private static processArgs() {
    commander.parse(process.argv);

    // If `--init` is passed, then create a config file at the current location
    if (commander.init) {
      const configJson: OptionsWrapper = _.cloneDeep({
        // Prevent changing defaults -> bad for tests
        benchmark: DefaultBenchmarkOptions,
        manager: DefaultBenchmarkManagerOptions,
      });
      const configFile = DefaultBenchmarkManagerOptions.config;
      delete configJson.manager.config;
      const configString = JSON.stringify(configJson, null, "\t");
      fs.writeFileSync(path.posix.join(process.cwd(), configFile), configString);
      process.exit(0);
    }
  }
}
