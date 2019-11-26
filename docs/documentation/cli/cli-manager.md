---
id: cli-manager
title: CLI Manager
---

```ts
export default class CLIManager {
  ...
}
```

The `CLIManager` class is responsible for everything CLI related, such as parsing params and providing information.

## printHeader

```ts
public static printHeader(): void;
```

Prints the ASCII art header

## setParams

```ts
private static setParams(): void;
```

Set the version and the possible params of the CLI.

## setExample

```ts
private static setExample(): void;
```

Sets the example that is printed out when using `--help`.

## processArgs

```ts
private static processArgs(): void;
```

Processes the args passed to the CLI.
