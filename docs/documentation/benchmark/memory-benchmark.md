---
id: memory-benchmark
title: MemoryBenchmark
---

```ts
export class MemoryBenchmark {
  ...
}
```

The `MemoryBenchmark` class contains all the functionality that does the memory benchmarking.

## new MemoryBenchmark()

When creating a new Memory benchmark, the GarbageCollector wrapper is initiated.
We need access to the garbage collector to do the memory benchmarking.
For more information see [GarbageCollector](garbage-collector.md).

The other values passed in the constructor have similar functionalies compared to [Benchmark](benchmark.md).

`count` is the sample count, or how many samples/measurements the benchmark should take. This can be limited using the options.

## start

When we start the benchmark, it first checks wether this should be async or not and then proceeds with the choosen logic.
The benchmark works like this.

1. Clean the memory by using the garbage collector.
2. Take a heap snapshot.
3. Execute code.
4. Take another heap snapshot.
5. Garbage collection.
6. Another heap snapshot.

This way we can see objects(manifesting in memory usage) left in heap after executing the code and how many of those can't be garbage collected immediately.
