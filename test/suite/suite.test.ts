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

import { merge } from "lodash";
import { expect } from "chai";
import { Benchmark, Suite, DefaultBenchmarkOptions } from "../../src";

describe("Suite", function () {
	describe("#constructor()", function () {
		it("should merge options with default options", function () {
			const suite = new Suite("id", "name", () => { }, "file.name", { minTime: 2 });
			const options = merge({}, DefaultBenchmarkOptions, { minTime: 2 });
			expect(suite.getOptions()).to.deep.equal(options);
		});
	});
	describe("#addChild()", function () {
		it("should add suite to children", function () {
			const parent = new Suite("id", "name", () => { }, "file.name", {});
			const child = new Suite("id-child", "name-child", () => { }, "file.name", {});
			parent.addChild(child);

			expect(parent.children).to.contain(child);
		});

		it("should add benchmark to children", function () {
			const parent = new Suite("id", "name", () => { }, "file.name", {});
			const child = new Benchmark("id-child", "name-child", () => { }, "file.name", {});
			parent.addChild(child);

			expect(parent.children).to.contain(child);
		});
	});
});