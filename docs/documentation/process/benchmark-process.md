---
id: benchmark-process
title: BenchmarkProcess
---

`BenchmarkProcess` creates a new Node.js Childprocess, executing the child.js script.

The child.js script in turn starts a `ChildProcessHandler` which interacts with the `BenchmarkProcess` by sending messages containing either errors or the benchmark results. Once the benchmark is finished and the results have been sent, the child process terminates.
