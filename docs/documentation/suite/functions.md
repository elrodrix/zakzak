---
id: functions
title: Functions
---

There are 4 essential methods that can be called in the benchmark files.

## benchmark()

```ts
function benchmark(name: string, fn: Function, options?: BenchmarkOptions): void;
```

This probably the most used function in the benchmark files.
Code inside this statement will be benchmarked.
The name will be used to display and identify the benchmark.
The options can optional and only affect this specific benchmark.
They take priority over any other option or configuration.

## suite()

```ts
function suite(name: string, fn: Function, options?: BenchmarkOptions): void;
```

Suites are used to structure the benchmark files and reduce code duplication.
Setup and teardown functions, aswell as options are all applied to it's children.

## setup()

```ts
function setup(fn: Function): void;
```

Setup functions contain code that should be executed before the benchmark.
They get execute in the order from outermost to innermost suite scope.

## teardown()

```ts
function teardown(fn: Function): void;
```

Teardown functions contain code that should be executed after the benchmark.
They get executed in the order from innermost to outermost suite scope.
