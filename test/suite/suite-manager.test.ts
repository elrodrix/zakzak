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

import { expect } from "chai";
import { merge, last, includes, cloneDeep } from "lodash";
import * as sinon from "sinon";
import {
  SuiteManager,
  DefaultBenchmarkOptions,
  Suite,
  suite,
  benchmark,
  setup,
  teardown,
} from "../../src";

function getSMfromGlobal() {
  const globalRef = global as any;
  return globalRef.suiteManager;
}

function deleteSM() {
  const globalRef = global as any;
  delete globalRef.suiteManager;
}

describe("SuiteManager", () => {
  afterEach(() => {
    deleteSM();
  });

  describe("#constructor()", () => {
    it("should combine options with default options", () => {
      const sm = new SuiteManager({ minTime: 3 });
      const mergedOptions = merge({}, DefaultBenchmarkOptions, { minTime: 3 });

      expect(sm["options"]).to.deep.equal(mergedOptions);
    });
    it("should set the instance field", () => {
      const sm = new SuiteManager({});

      expect(getSMfromGlobal()).to.equal(sm);
    });
  });

  describe(".getInstance()", () => {
    it("should return instance from global", () => {
      const globalRef = global as any;
      globalRef.suiteManager = { test: 123 };

      expect(SuiteManager.getInstance()).to.deep.equal({ test: 123 });
    });
  });

  describe("#addBenchmark()", () => {
    let sm: SuiteManager;
    beforeEach(() => {
      sm = new SuiteManager({});
      sm["currentPath"].push(
        new Suite("foobar.js", "foobar.js", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a", "a", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a:b", "b", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a:b:c", "c", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a:b:c:d", "d", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a:b:c:d:e", "e", () => {}, "foobar.js", {
          minSamples: 1,
          maxSamples: 10,
        }),
      );
    });

    it("should construct the correct id", () => {
      sm.addBenchmark("test", () => {}, {});
      expect(sm.benchmarks[0].id).to.equal("foobar.js:a:b:c:d:e:test");
    });

    it("should pass options from parent to child", () => {
      sm.addBenchmark("test", () => {}, { minTime: 20, minSamples: 2 });
      const options = DefaultBenchmarkOptions;
      options.minSamples = 2;
      options.maxSamples = 10;
      options.minTime = 20;
      expect(sm.benchmarks[0].getOptions()).to.deep.equal(options);
    });

    it("should add benchmark as child to parent suite", () => {
      sm.addBenchmark("test", () => {}, {});
      const parent = last(sm["currentPath"]);
      expect(includes(parent.children, sm.benchmarks[0])).to.be.true;
    });
  });

  describe("#addSuite()", () => {
    let sm: SuiteManager;
    beforeEach(() => {
      sm = new SuiteManager({});
      sm["currentPath"].push(
        new Suite("foobar.js", "foobar.js", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a", "a", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a:b", "b", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a:b:c", "c", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a:b:c:d", "d", () => {}, "foobar.js", {}),
        new Suite("foobar.js:a:b:c:d:e", "e", () => {}, "foobar.js", {
          minSamples: 1,
          maxSamples: 10,
        }),
      );
    });

    it("should construct the correct id", () => {
      sm.addSuite("test", () => {}, {});
      expect(last(sm.suites).id).to.equal("foobar.js:a:b:c:d:e:test");
    });

    it("should pass options from parent to child", () => {
      sm.addSuite("test", () => {}, { minTime: 20, minSamples: 2 });
      const options = DefaultBenchmarkOptions;
      options.minSamples = 2;
      options.maxSamples = 10;
      options.minTime = 20;
      expect(last(sm.suites).getOptions()).to.deep.equal(options);
    });

    it("should add suite as child to parent suite", () => {
      sm.addSuite("test", () => {}, {});
      const parent = last(sm["currentPath"]);
      expect(includes(parent.children, last(sm.suites))).to.be.true;
    });

    it("should execute the callback", () => {
      const stub = sinon.stub();
      sm.addSuite("test", stub, {});

      expect(stub.called).to.be.true;
    });

    it("should push new suite to current path while executing callback", () => {
      let pathCopy: Suite[];
      const fake = sinon.fake(() => {
        pathCopy = cloneDeep(sm["currentPath"]);
      });
      sm.addSuite("test", fake, {});

      expect(last(pathCopy).name).to.equal("test");
      expect(last(sm["currentPath"]).name).to.not.equal("test");
    });
  });
});
describe("suite()", () => {
  beforeEach(() => {
    // eslint-disable-next-line no-new
    new SuiteManager({});
  });
  afterEach(() => {
    deleteSM();
  });
  it("should add new suite", () => {
    suite("test123", () => {});
    expect(getSMfromGlobal().suites[0]).to.exist;
    expect(getSMfromGlobal().suites[0].name).to.equal("test123");
  });
});
describe("benchmark()", () => {
  beforeEach(() => {
    // eslint-disable-next-line no-new
    new SuiteManager({});
  });
  afterEach(() => {
    deleteSM();
  });
  it("should add new benchmark", () => {
    benchmark("test123", () => {});
    expect(getSMfromGlobal().benchmarks[0]).to.exist;
    expect(getSMfromGlobal().benchmarks[0].name).to.equal("test123");
  });
});

describe("setup()", () => {
  afterEach(() => {
    deleteSM();
  });
  it("should add a setup function", () => {
    const sm = new SuiteManager(DefaultBenchmarkOptions);
    sm.addSuite(
      "test",
      () => {
        setup(function abc() {
          Math.random();
        });
      },
      {},
    );

    const td = getSMfromGlobal().suites[0]["setups"][0];
    expect(td).to.exist;
    expect(td.name).to.equal("abc");
  });
  it("should be called in the correct order", () => {
    const sm = new SuiteManager(DefaultBenchmarkOptions);
    sm.addSuite(
      "test",
      () => {
        setup(function a() {
          Math.random();
        });
        suite("test-child", () => {
          setup(function b() {
            Math.random();
          });
          setup(function b2() {
            Math.random();
          });
          benchmark("xyz", () => {});
        });
        setup(function a2() {
          Math.random();
        });
      },
      {},
    );

    const names = sm.benchmarks[0]["setups"].map(f => f.name);
    expect(names).to.deep.equal(["a", "a2", "b", "b2"]);
  });
});

describe("teardown()", () => {
  afterEach(() => {
    deleteSM();
  });
  it("should add a teardown function", () => {
    const sm = new SuiteManager(DefaultBenchmarkOptions);
    sm.addSuite(
      "test",
      () => {
        teardown(function xyz() {
          Math.random();
        });
      },
      {},
    );

    const td = getSMfromGlobal().suites[0]["teardowns"][0];
    expect(td).to.exist;
    expect(td.name).to.equal("xyz");
  });
  it("should be called in the correct order", () => {
    const sm = new SuiteManager(DefaultBenchmarkOptions);
    sm.addSuite(
      "test",
      () => {
        teardown(function a() {
          Math.random();
        });
        suite("test-child", () => {
          teardown(function b() {
            Math.random();
          });
          teardown(function b2() {
            Math.random();
          });
          benchmark("xyz", () => {});
        });
        teardown(function a2() {
          Math.random();
        });
      },
      {},
    );

    const names = sm.benchmarks[0]["teardowns"].map(f => f.name);
    expect(names).to.deep.equal(["b", "b2", "a", "a2"]);
  });
});
