---
id: options
title: Options
---

## BenchmarkOptions

```ts
export interface BenchmarkOptions {
  minTime?: number;
  minSamples?: number;
  maxTime?: number;
  maxSamples?: number;
  minIterations?: number;
  maxIterations?: number;
}
```

- `minTime` is the minimum time that the warmup procedure has to be run. Also the minimum time for a single cycle.
- `minSamples` is the minimum amount of samples that have to be collected.
- `maxTime` is the maximum time allowed for taking samples.
- `maxSamples` is the maximum amount of samples that should be collected
- `minIterations` is the minimum amount of iterations that the code should run in a single benchmark. Ignored if value is equal to, or below zero.
- `maxIterations` is the maximum amount of iterations that the code should run in a single benchmark. Ignored if value is equal to, or below zero.

## BenchmarkManagerOptions

```ts
export interface BenchmarkManagerOptions {
  runParallel?: number;
  pattern?: string;
  path?: string;
  exporter?: string[];
  config?: string;
}
```

- `runParallel` is the amount of benchmarks to run in parallel. If the number is smaller than or equal to 1, they will be run in series.
- `pattern` is a glob pattern that matches the files containing the benchmarks.
- `path` is the path from which glob will search for files.
- `exporter` is a list of exporters that will output the benchmark data. Default ones are `console`, `console-async`, `xml`, `json`, `csv` and `hierarchy`. Can also be path to a file that defines a custom exporter.
- `config` is the path to the config file.

The options interface for managing the benchmarks.

## OptionsWrapper

```ts
export interface OptionsWrapper {
  benchmark: BenchmarkOptions;
  manager: BenchmarkManagerOptions;
}
```

A wrapper interface for the two options objects.

## DefaultBenchmarkOptions

```ts
export const DefaultBenchmarkOptions: BenchmarkOptions = {
  minTime: 50 * TimeUnit.Millisecond,
  minSamples: 5,
  maxTime: 5 * TimeUnit.Second,
  maxSamples: 5000,
  minIterations: 0,
  maxIterations: 0,
};
```

The default benchmark options.

## DefaultBenchmarkManagerOptions

```ts
export const DefaultBenchmarkManagerOptions: BenchmarkManagerOptions = {
  runParallel: 1,
  pattern: "./**/*.benchmark.js",
  path: "./",
  exporter: ["console"],
  config: "zakzak.config.json",
};
```

The default benchmark manager options.
