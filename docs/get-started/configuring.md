---
id: configuring
title: Configuring
---

There are multiple ways of configuring a zakzak and the benchmarks, each with it's own purpose.

## Config file

If you followed the previous steps you should already have a config file name `zakzak.config.json` that looks like this.

```json
{
  "benchmark": {
    "minTime": 50000000,
    "minSamples": 5,
    "maxTime": 5000000000,
    "maxSamples": 5000,
    "minIterations": 0,
    "maxIterations": 0
  },
  "manager": {
    "runParallel": 1,
    "pattern": "./**/*.benchmark.js",
    "path": "./",
    "exporter": ["console"]
  }
}
```

You can change all values inside this json, or just omit some. If you omit a value, the default value for that option will be taken.
When creating the json using `zakzak --init`, it will automatically be filled with the default values from zakzak.

Per default, zakzak will look for a `zakzak.config.json`, and if you rename that file, zakzak won't find it automatically.
You can however pass the name of the config file using a cli param.

```text
$ zakzak --config zekzok.json
```

## CLI params

Some of the values can be configured using the cli.
You can view the params and the usage of the cli using the `--help` param.

```text
$ zakzak --help
Usage: zakzak [options]

Options:
  -v, --version            output the version number
  -p, --pattern <pattern>           file pattern to match the benchmarking files
  -P, --path <path>              path to look for files
  -c, --config <path>            path to config file (default: "zakzak.config.json")
  -e --exporter <path>           path to custom exporter
  --init                   copies a zakzak config to the current directory
  -h, --help               output usage information

Examples:
 $ zakzak
 $ zakzak -P ./src/benchmarks
 $ zakzak -P ./src -p *.zakzak-boommboom.js
 $ zakzak -p *.benchmark-this.js -e serial-exporter.js
```

One of the limitations of the cli is, that you can only pass one exporter, instead of the multiple exporters that you can pass in the config file.
The exporter passed using the param, will be used additionally to the exporters defined in the config.

## Benchmark files

The probably most used way of configuring the benchmarks, is through the benchmark files and the code itself.
You can pass an options object to the `benchmark(...)` statement, which only changes the values for this specific benchmark and does not affect other benchmarks.

```ts
benchmark("foobar", () => {...}, { maxOperations: 1000 });
```

You can also pass this options object to a suite, which will apply those options to all it's children.

```ts
suite("foo",()=>{
  benchmark("bar", () => {...});
  benchmark("baz", () => {...}, { minOperations: 10 });
}, { minOperations: 20 });
```

If a child of the suite also gets a value for the same configuration param, the value of the child overwrites that of the parent for the benchmark.

The full options object looks like this.

```ts
interface BenchmarkOptions {
  /**
   * The minimum time that the warmup procedure has to be run.
   * Also the minimum time for a single cycle.
   */
  minTime?: number;
  /**
   * The minimum amount of samples that have to be collected
   */
  minSamples?: number;
  /**
   * The maximum time allowed for taking samples
   */
  maxTime?: number;
  /**
   * The maximum amount of samples that should be collected
   */
  maxSamples?: number;
  /**
   * The minimum amount of iterations that the code should run in a single benchmark.
   * Ignored if value is equal to, or below zero.
   */
  minIterations?: number;
  /**
   * The maximum amount of iterations that the code should run in a single benchmark.
   * Ignored if value is equal to, or below zero.
   */
  maxIterations?: number;
}
```
