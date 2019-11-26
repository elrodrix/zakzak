---
id: export-manager
title: ExportManager
---

The `ExportManager` handles the exporters.
It can handle multiple exporters at the same time and is also responsible for importing custom exporters defined by users.

The manager has similar method to the abstract `Exporter` class, only are they used to pass messages to the created exporters.

## getExporter

```ts
private getExporter(exporterString: string): Exporter;
```

This method checks if the `exporterString`, parsed from the options, matches any of the default exporters.
If not, it assumes the string is a filepath to a .js file where a custom exporter is defined.

It then tries to `require` the filepath and searches for exports in the required object.
It assumes all exported classes extend `Exporter`, calls their constructor and instantiates them.
