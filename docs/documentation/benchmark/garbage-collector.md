---
id: garbage-collector
title: GarbageCollector
---

```ts
export class GarbageCollector {
  ...
}
```

The `GarbageCollector` class is a wrapper that stores a function that exposes the garbage collector

## init

The `init` function sets the v8 flags to expose the garbage collector

```
--expose_gc
```

Now, if we execute something in a new context using `vm.runInNewContext`, we have access to the `gc()` function.
We save the `gc` from the new context in a static variable so it can be accessed by this context.

## collect

The `collect` function simply calls the private variable `gc` which should contain the exposed `gc()` function from `init`.
If `init` has not been called yet, the `gc` function simply prints an error to the console, saying it is not initialized yet.
