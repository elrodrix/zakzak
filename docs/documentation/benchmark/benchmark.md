---
id: benchmark
title: Benchmark
---

```ts
export class Benchmark {
  ...
}
```

The `Benchmark` class contains all the functionality that does the benchmarking.

## new Benchmark()

```ts
public constructor(
    public id: string,
    public name: string,
    public fn: Function,
    public filepath: string,
    options: BenchmarkOptions,
) {...};
```

`id` is a uid for the benchmark. Usually composed of a filename, parent suites and benchmarkname separated by colons.
`name` is the name of the benchmark.
`fn` is the function that will be benchmarked.
`filepath` is the path of the file in which the benchmark is located.
`options` is the options object of the benchmark.

Creates a new Benchmark.
If `options.minSamples` is smaller than 1, the default value for that field is taken.
All other fields that are set, get substituted with the default options.

## start

```ts
public start(): Promise<BenchmarkResult>;
```

Starts the benchmark.
First it calculates the minTime based on timer and options.
Then the setups are executed and the benchmark checks if the code is asynchronous.
It then calculates the optimal amount of times to execute the code and collects samples until it has enough or the maxTime is reached.
The samples are then analyzed to give some statistics about it and returned.

## applySetupAndTeardown

```ts
public applySetupAndTeardown(setups: Function[] = [], teardowns: Function[] = []): void;
```

`setups` is a list of setup functions;
`teardowns` is a list of teardown functions

The setup functions get added to the start of the existing list of setup functions.
The teardown functions get appended to the existing list of teardown functions.

## getMinTime

```ts
private getMinTime(): number;
```

Calculates the minimum time that a benchmark should run.
First it calculates the resolution of the timer.
Based on that time, it calculates the time needed to reduce the uncertainty of a measurement to 1 percent.
It then either returns that value, or the value from the options, depending on which is bigger.

## isAsync

```ts
private isAsync(): boolean;
```

Evaluates wether the code that will be benchmarked is asynchronous or not.
This is done by checking the return value of the code for a `.then` method, which implies a promise like behaviour.

## getMaxCycles

```ts
private getMaxCycles(minTime: number): number;
```

`minTime` is the minimum amount of time that a single sample should take.

Calculates the amount of times the code has to be repeated in order for it to take at least as long as `minTime` or reach the `options.maxIterations`.

## cycle

```ts
private cycle(count: number, minTime: number): {count: number, finished: bool};
```

`count` is the amount of times the benchmark should be repeated.
`minTime` is the target minimum time, that should be reached by repeating the benchmark.

Executes the benchmark `count` times, measures how long it took and then estimates, how many more repitions would be needed until the `minTime` is reached. It then returns that estimate. If the minimum time was reached then `finished` is set to true and returned.

## getSamples

```ts
private getSamples(count: number): number[];
```

`count` is the amount of times the benchmark code should be repeated for a single sample.

Collects samples by repeating the looped benchmark code and returns the samples.
One sample is the total amount of time needed for repeating the benchmark `count` times.

This is done until `options.minSamples` is reached.
Then it continues to collect samples until `options.maxSamples` or `options.maxTime` is reached.

## execute

```ts
private execute(count: number): number;
```

`count` is the amount of times the benchmark code should be repeated.

Repeats the benchmark code for `count` times and measures the total duration.
It then returns the measured duration in ns.

## BenchmarkResult

```ts
interface BenchmarkResult {
  id: string;
  name: string;
  filename: string;
  stats: FullAnalysis;
  times: number[];
  count: number;
  options: BenchmarkOptions;
}
```

The result of a benchmark.
Contains the samples in the `times` field.
