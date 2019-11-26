---
id: exporter
title: Exporter
---

```ts
export abstract class Exporter {
  ...
}
```

The `Exporter` class is an abstract class that receives an EventEmitter in its constructor.

```ts
constructor(em: EventEmitter) {
    em.on(ExporterEvents.Hierarchy, this.onHierarchy.bind(this));
    em.on(ExporterEvents.Result, this.onResult.bind(this));
    em.on(ExporterEvents.Finished, this.onFinished.bind(this));
    em.on(ExporterEvents.Error, this.onError.bind(this));
}
```

`em` is the EventEmitter that emits events from inside the benchmarking process.

## Methods

The Exporter subscribes member methods on certain events.
These member methods are

- `onHierarchy(root: Suite[]): void`
- `onResult(result: BenchmarkResult): void`
- `onFinished(results: BenchmarkResult[]): void`
- `onError(error: Error, benchmarkId: string): void`

## Events

```ts
export enum ExporterEvents {
  Hierarchy = "hierarchy",
  Result = "result",
  Finished = "finished",
  Error = "error",
}
```

Possible events that the exporter can listen on.
