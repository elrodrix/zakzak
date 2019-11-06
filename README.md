<p align="center">
  <img src="https://user-images.githubusercontent.com/22956519/66310240-f96b9480-e90b-11e9-9add-4c8bc8ea8707.png" height="180px"/>
</p>
<h1 align="center">Zakzak</h1><!-- omit in toc -->
<h3 align="center">🏎️ 📄 ⏱️ </h3><!-- omit in toc -->
<h3 align="center">When you need to make sure that your code is fast.</h3><!-- omit in toc -->
<p align="center">
  Zakzak makes microbenchmarking in node.js projects easier and automated, by using a "unit test"-like approach.
</p>
<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="Zakzak is release under the Apache 2.0 license." />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://badgen.net/badge/Built%20With/Typescript/blue" alt="Zakzak is built with and supports Typescript" />
  </a>
  <img src="https://dev.azure.com/dynatrace-opensource/zakzak/_apis/build/status/Dynatrace.zakzak?branchName=master" />
  <img src="https://img.shields.io/azure-devops/coverage/dynatrace-opensource/zakzak/1?style=flat" />
</p>

## Table of Contents<!-- omit in toc -->

<!-- toc -->

- [Usage](#usage)
- [Documentation](#documentation)
  - [Define benchmarks](#define-benchmarks)
  - [Structure the benchmarks using suites](#structure-the-benchmarks-using-suites)
  - [Setup and Teardown](#setup-and-teardown)
  - [Async Benchmarks](#async-benchmarks)
  - [Configuration](#configuration)
  - [CLI](#cli)
  - [Custom Exporter](#custom-exporter)
  - [Typescript support](#typescript-support)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Using npm](#using-npm)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

<!-- tocstop -->

## Usage

Similar to unit tests, you create `*.benchmark.js` files, in which you define your benchmarks. If you've worked with mocha.js before, you will find this approach familiar.

```ts
import { suite, benchmark } from "@dynatrace/zakzak";

suite("crypto-functions", () => {
  benchmark("encryptMessage", () => {
    const msg = "foobar";
    encryptMessage(msg);
  });

  benchmark("hashSomePassword", () => {
    hashSomePassword("secret-pw");
  });
});
```

Then you run the benchmarks, using the cli.

```bash
$ zakzak --path ./src/benchmarks --exporter json
```

## Documentation

### Define benchmarks

Benchmarks are easily defined. Just write the following and make sure `zakzak` reads the file where the benchmark was defined.

```ts
benchmark("some-name", () => {
  fibonacci(5000);
});
```

I recommend putting these definitions in separate files, and to name those files with a specific pattern, so `zakzak` can find them using a `glob` pattern. Zakzak uses [globby](https://github.com/sindresorhus/globby) internally. The default filepattern is `*.benchmark.js`, but you can provide a different pattern using CLI params or the config.

While it is possible to define these benchmarks in your source code, I highly advise against it. `zakzak` uses `require` to read all the files you point it to and thus executes them.

### Structure the benchmarks using suites

A suite is just a fancy way of grouping benchmarks or suites together and applying options.

```ts
suite("suite-name", () => {
  benchmark("some-name", () => {
    fibonacci(5000);
  });
});
```

Suites can also be nested and contain other suites, building a hierarchy.

```ts
suite("momma-suite", () => {
  benchmark("some-name", () => {
    fibonacci(5000);
  });
  suite("suite child", () => {
    suite("suite niece", () => {
      suite("such a 'suite' boy", () => {
        benchmark("benchy", () => {
          fibonacci(5000);
        });
      });
    });
    benchmark("benchling", () => {
      fibonacci(5000);
    });
  });
});
```

There is no limit as to how many nested levels or children you can have.

**Note**: Every file is per default a suite. So even if you don't define any suites, a benchmark will always be a child of a suite. This is done to keep track of the structure and location of benchmarks.

### Setup and Teardown

`setup()` and `teardown()` are two more functions, that can be utilized in the .benchmark.ts files. As their names suggest, they run setup and teardown code, before and after the benchmarking. Important to note is, that code is only run once before and/or after the benchmarking, and is not repeated everytime the benchmarking code runs.

```ts
suite("demo", ()=>{
  setup(()=>{
    dbconnection = connectToDb();
  });
  benchmark("some-db-stuff",()=>{
    ...
  });
  teardown(()=>{
    dbconnection.close();
  });
});
```

The hierarchy system using suites can be also be leveraged by lifetime functions, such as setup and teardown. Lifetime functions from a parent suite also apply to all child suites, however there is a order in which parent and child lifetime functions are executed.
For setup functions it works like this.

```ts
suite("a", () => {
  setup(() => {}); // is executed first
  suite("b", () => {
    setup(() => {}); // is executed second
  });
});
```

For teardown functions the order is reversed.

```ts
suite("a", () => {
  teardown(() => {}); // is executed second
  suite("b", () => {
    teardown(() => {}); // is executed first
  });
});
```

### Async Benchmarks

To Benchmark asynchronous stuff, either return a Promise that resolves, onces you're finished or mark you function as `async` (which makes it return a promise).

```ts
benchmark("promise", () => {
  return willReturnAPromise();
});

benchmark("async-await", async () => {
  doStuffThatsAsync();
});
```

### Configuration

There multiple ways to configure your benchmarks:

- Using the CLI params
- Using a config
- In the benchmark files using the options param
- Not at all. Just use the default values

These options are non exclusive, meaning that if you use one of these options, that does not prohibit you from using one of the others additionally. If two configuration types however define a value for the same option, the one with higher priority will be taken.
The priorities are the following, listed from low to high.

```
Default -> Config -> CLI Param -> Suite options -> Benchmark options
```

In the benchmark files, you apply options like this.

```ts
benchmark(
  "snowflake-with-custom-needs",
  () => {
    fibonacci(5000);
  },
  { minSamples: 20, maxSamples: 50 }, // options
);
```

You can also pass the options to a suite, which will then apply those to it's children. However, if an enclosed suite or benchmark has it's own options, then those will be prioritized over the options of the parent suite.

```ts
suite(
  "momma-suite",
  () => {
    // has minSamples: 10
    benchmark("some-name", () => {
      fibonacci(5000);
    });
  },
  { minSamples: 10 },
);
```

Defining options is optional, no matter what type of configuration is used.
If none of the configuration types provides a value for an options field, then the default values of the framework will be used.

### CLI

The CLI tool is used to find, structure and run the benchmarks. Per default, it will look for a `zakzak.config.json` in the current working directory. If it doesn't find this config, it will use the default values of the framework. You can also override some of the settings using the CLI params.

- **`-v, --version`:** Output the version number of zakzak.
- **`-p, --pattern <pattern>`:** Glob pattern used to match the targeted files.
- **`-P, --path <path>`:** Relative or absolute path to folder which contains the files.
- **`-c, --config <path>`:** Relative or absolute path to the config. Default is `zakzak.config.json`.
- **`-e, --exporter <path-or-name>`:** Add an additional exporter. Can be one of the default exporters, i.e. `console`, `console-async`, `xml`, `json` and `csv` or a custom exporter. If it's a custom exporter then enter the path to the file containing it.
- **`--init`:** Initializes a project by creating a `zakzak.config.json` with the default values.
- **`-h, --help`:** Prints information on the cli and it's usage.

### Custom Exporter

If the default exporters can't do what you need, you can always write a custom exporter and pass it to zakzak.
Just create a new `.js` file, where you define a new class that extends `Exporter`.

**Note:** It's easier to explain this using Typescript code. Just leave the types if you're writing in javascript.

```ts
import { Exporter, Suite, BenchmarkResult } from "@dynatrace/zakzak";

export class AwsS3Exporter extends Exporter {
  onHierarchy(root: Suite[]): void {
    console.log(root);
  }
  onResult(result: BenchmarkResult): void {
    console.log(result);
  }
  onFinished(results: BenchmarkResult[]): void {
    console.log(results);
  }
  onError(error: Error, id: string): void {
    console.log(id + " " + error.message);
  }
}
```

The exporter gets its information using an `EventEmitter` that is passed to the constructor.
The `onHierarchy`, `onResult`, `onFinished` are set in the base constructor and automatically handle their specific events.

**`onHierarchy`** gets triggered once zakzak has found all benchmarks, suite and their hierarchy. You can traverse this tree-hierarchy by accessing the children of a suite and the children of those children, until there are no more children.

**`onResult`** is triggered as soon as a benchmark finishes and outputs its results. This can be used to have a live preview of which benchmarks are still running and which are already finished.

**`onFinished`** returns the results of all the benchmarks, once they are all finished.

**`onError`** returns an error that has been thrown during a benchmark and the id of the benchmark.

### Typescript support

`zakzak` is written in Typescript, so it comes with it's own set of type definitions.
The CLI however, can only use `.js` files, so you have to point it to the compiled/transpiled `.js` files and not the `.ts` files.

## Installation

### Prerequisites

Note: `zakzak` might work with earlier versions of node, but is yet to be tested with those.

- Node.js @8.x or higher
- NPM @6.4.x or higher

### Using npm

Install `zakzak` globally or locally in your project using `npm`.

**NOTE:** Zakzak is not yet released on npm, since it's still under development. If you have downloaded or installed a package called zakzak, than it is not this project and most likely malicious.

```bash
$ npm install -g @dynatrace/zakzak # global
$ npm install --save-dev @dynatrace/zakzak # local
```

You can then initialize your project, which creates a `zakzak.config.json` in your directory.

```bash
$ zakzak --init
```

## Contributing

Read the `CONTRIBUTING.md`

## Acknowledgements

While this work was done without directly copying anything from other projects, the core benchmark logic was inspired by the logic from benchmark.js by Mathias Bynens.

## License

Copyright 2019 Dynatrace LLC

Licensed under the Apache License, Version 2.0 (the "License");
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
