---
id: structuring
title: Structuring the benchmarks
---

If you have more benchmarks it can get messy fast, especially in big projects.
One way to help structure the benchmarks, is by splitting them up into multiple files and place them in separate folders.
You can also structure benchmarks inside a single file using Suites and the `suite()` statement.

```ts
import { benchmark, suite } from "@dynatrace/zakzak";

const obj = { a: 28, b: 82, c: "hello", d: 983, e: "foo", o: "key", f: "bar", g: 8 };
const key = "key";

suite("check-object-key", () => {
  benchmark("inIterator", () => {
    return key in obj;
  });
  benchmark("tripleEqualUndefined", () => {
    return obj[key] !== undefined;
  });
  benchmark("useHasOwnProperty", () => {
    return obj.hasOwnProperty(key);
  });
});
```

Suites logically group benchmarks together, this way you can structure them better in a hierarchic matter.
Furthermore, you can use suites to apply options to a group of benchmarks, instead of configuring each of them.
