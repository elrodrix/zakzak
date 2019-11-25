---
id: exporting
title: Exporting
---

The process of outputting benchmark results from zakzak is called exporting. You can either use one of the default exporters that ship with zakzak per default or you can write your own custom exporter.

## Default exporter

You can set the exporters using the [configuration](configuring.md).
The default exporters are the following:

- `console` => Exports results once all benchmarks are finished. Better formatting in console.
- `console-async` => Exports results live, as soon as a benchmark finishes. Worse formatting than `console`.
- `xml` => Exports results in an xml file
- `json` => Exports results in a json file
- `csv` => Exports results in a csv file
- `hierarchy` => Exports results live and displays them in a list with indentation to represent the hierarchy of the suites.

You can set multiple exporters, however if you pick multiple exporters that write to the console, there will most likely be formatting problems.

## Custom exporter

If the default exporters don't provide the functionality that you need, you can always write your own exporter.
You just create a \*.ts file, define a class that extends the `Exporter` class, override the implemented methods and then pass the filepath to the exporter configuration.

```ts
import { Exporter, Suite } from "@dynatrace/zakzak";

export default class SomeExporter extends Exporter {
  onHierarchy(root: Suite[]) {
    console.log(root.length);
  }
}
```

The following methods are available for overriding.

```ts
onError(error: Error){...}
onResult(result: BenchmarkResult){...}
onFinished(results: BenchmarkResult[]){...}
onHierarchy(root: Suite[]){...}
```
