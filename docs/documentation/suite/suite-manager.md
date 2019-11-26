---
id: suite-manager
title: SuiteManager
---

The `SuiteManager` is responsible for interpreting and parsing benchmark files.

First it uses `require` to read the benchmark files, thereby automatically executing the functions in the file.
Each function then adds the code it contains to an internal list in the manager.
The manager then recursively repeats this procedure, calling those newly registered functions and interpreting the functions they add.

_Example_

```ts
suite("a", ()=>{
  suite("b",()=>{
    benchmark("c"()=>{
      something();
    })
  })
  benchmark("d", ()=>{
    somethingElse();
  })
});
```

1. The file is required and the `suite("a",...)` is executed
   1. The `suite` statement registers a new suite named "a" at the manager.
2. There are no other functions at this level so the manager goes one level deeper in the recursion
3. `suite("b",...)` is executed and registered at the manager
4. `benchmark("d")` is executed and registered
   1. A benchmark is the end of the recursion, as the code inside will only be executed once the benchmarking has begun
5. There are no other functions at this level so the manager goes one level deeper in the recursion
   ...
   This continues until all functions have been executed and all benchmarks, suites and co. have been registered.
