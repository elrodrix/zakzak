# zakzak

`zakzak` is a framework which aims to make microbenchmarking easier, especially with large projects.
It delivers qualitative and consistent benchmarks and uses a unit test like structure for creating and defining benchmarks.

## Getting started

### Prerequisites

Note: `zakzak` might work with earlier versions of node, but is not officially supported

- Node.js @8.x or higher
- NPM @6.4.x or higher

### Installation

Install `zakzak` globally using `npm`.

```
npm install -g zakzak
```

Or install it locally and use `npx` for running the CLI tool.

```
npm install --save-dev zakzak
```

That's it. Now you can run `zakzak` in the terminal.
Now you only need to define the benchmarks.

```
zakzak --help
```

### Define benchmarks

Benchmarks are easily defined. Just write the following and make sure `zakzak` reads the file where the benchmark was defined.

```ts
benchmark("some-name", () => {
	fibonacci(5000);
});
```

If you are using Typescript (which i highly encourage you to do), you can import `zakzak` to get types for `benchmark`.

I recommend putting these definitions in separate files, and to name those files with a specific pattern, so `zakzak` can find them using a `glob` pattern. The default filepattern `zakzak` looks for is `*.benchmark.js`, but you can provide a different pattern using CLI params or the config.

While it is possible to define these benchmarks in your source code, I highly advise agains it. `zakzak` uses `require` to read all the files you point it to and thus executes them. Furthermore, `benchmark` and `suite` are globals that only exist inside zakzak and your code will throw errors if they are called outside of `zakzak`.

### Structure the benchmarks using suites

A suite is just a fancy way of grouping benchmarks or more suites together and applying options.

```ts
suite("some-suite-name", ()=>{
	benchmark("some-name", ()=>{
		fibonacci(5000);
	});
});
```

Suites can also be nested and contain other suites, building a tree structure.

```ts
suite("momma-suite", ()=>{
	benchmark("some-name", ()=>{
		fibonacci(5000);
	});
	suite("suite child", ()=>{
		suite("suite niece", ()=>{
			suite("such a 'suite' boy", ()=>{
				benchmark("benchy", ()=>{
					fibonacci(5000);
				});
			});
		});
		benchmark("benchling", ()=>{
			fibonacci(5000);
		});
	});
});
```

There is no limit as to how many nested levels or children you can have.

Note: Every file is per default a suite. So even if you don't define any suites, a benchmark will always be a child of a suite. This is done to keep track of the structure and location of benchmarks.

### Configuration

There multiple ways to configure your benchmarks:

- Using the CLI params
- Using a config
- In the benchmark files using the options param
- Not at all. Just use the default values

These options are non exclusive, meaning that if you use one of these options, that does not prohibit you from using one of the others additionally. If two configuration types however define a value for the same option, the one with higher priority will be taken.
The priorities are the following, listed from low to high.

```
Default -> Config -> CLI Param -> Benchmark files -> Parent Suite -> Current Options
```

In the benchmark files, you apply options like this.

```ts
benchmark("snowflake-with-custom-needs", ()=>{
	fibonacci(5000);
}, { minSamples: 20, maxSamples: 50});
```

You can also pass the options to a suite, which will then apply those to it's children. However, if an enclosed suite or benchmark has it's own options, then those will be prioritized over the options of the parent suite.

```ts
// has minSample: 10
suite("momma-suite", ()=>{

	// has minSamples: 10
	benchmark("some-name", ()=>{
		fibonacci(5000);
	});

	// has minSamples: 10
	suite("suite child", ()=>{

		// has minSamples: 20
		suite("suite niece", ()=>{

			// has minSamples: 30
			suite("such a 'suite' boy", ()=>{

				// has minSamples: 2
				benchmark("benchy", ()=>{
					fibonacci(5000);
				}, { minSamples: 2 });

				// has minSamples: 30
				benchmark("bench-o-mat", ()=>{
					fibonacci(5000);
				});

			}, { minSamples: 30 });

			// has minSamples: 20
			benchmark("big-bro-bench", ()=>{
				fibonacci(5000);
			});

		}, { minSamples: 20});

		// has minSamples: 10
		benchmark("benchling", ()=>{
			fibonacci(5000);
		});
		
	});
}, { minSamples: 10 });
```

Defining options is optional, no matter what type of configuration is used.
If none of the configuration types provides a value for an options field, then the default value will be used.

And that's it. You are now ready to go and benchmark the heck out of your code.

## Contributing

Read the rules, code of conduct and then just go ahead, fork the repo and create a pull request when you're done.

## License

Copyright 2019 Dynatrace LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.