#!/usr/bin/env node

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
import { CLIManager } from ".";

CLIManager.init();

const entrypoint = path.posix.join(
  process.cwd(),
  "node_modules/@dynatrace/zakzak/dist/src/entrypoint.js",
);

try {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(entrypoint);
} catch (error) {
  if (error instanceof Error && error.message.indexOf("Cannot find module") !== -1) {
    console.error(`No zakzak installation found under ${entrypoint}`);
  } else {
    console.error(error);
  }
}
