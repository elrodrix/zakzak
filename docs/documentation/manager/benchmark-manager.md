---
id: benchmark-manager
title: BenchmarkManager
---

The `BenchmarkManager` is responsible for running all the benchmarks.
It redirects events from the benchmarks to the `ExporterManager` and it creates and keeps track of the child processes in which the benchmarks run.
It can run them in parallel, employing a thread pool like logic, only with promises.
