---
id: setup
title: Setup
---

## Prerequesites

### Node.js

If you want to do Node.js benchmarks, you obviously need Node.js itself installed. We recommend installing it with [nvm](https://github.com/nvm-sh/nvm) but you can also install it the normal way. You need atleast version 10.x.x or later.

### NPM

You also need to install NPM, since zakzak is an npm package.

### Typescript (optional)

Zakzak is written in typescript, so it works with both javascript and typescript flawlessly. We recommend using Typescript, but you can still use it with plain Javascript if you like.

## Installation

Navigate to your Node.js project and then install zakzak in the project using NPM. We recommend to save it as dev-dependency.

```bash
$ npm install --save-dev @dynatrace/zakzak
```

You can then call `zakzak --version` to verify if it works.

```bash
$ npx zakzak --version
```

If you want to be able to just call `zakzak` without `npx` you have to install it globally too.

```bash
$ npm install -g @dynatrace/zakzak
```

Now you should be able to call `zakzak` without `npx`.

```bash
$ zakzak --version
```

Bear in mind, that when executing benchmarks, zakzak will always use the locally installed version. So even if your global installation has a newer or older version, it basically just calls the locally installed version and uses that one instead.

## Set up project

### Config

Once zakzak is installed you can set it up in your project.
First you'll want to have a config for zakzak. Create it using the cli.

```
$ zakzak --init
```

The CLI will then create a `zakzak.config.json` with default values in your directory. This config file will be used to configure the behaviour of zakzak. The config should look somewhat like this.

```json
{
  "benchmark": {
    "minTime": 50000000,
    "minSamples": 5,
    "maxTime": 5000000000,
    "maxSamples": 5000,
    "minIterations": 0,
    "maxIterations": 0
  },
  "manager": {
    "runParallel": 1,
    "pattern": "./**/*.benchmark.js",
    "path": "./",
    "exporter": ["console"]
  }
}
```

### First benchmark

Next you will want to create your first benchmark.
However before we do that, we should probably set up a folder and point the config to that folder, so it does not get chaotic.
The folder setup for this tutorial looks like this.

```text
project-root/
├build/
│ ├src/
│ ├test/
│ └benchmark/
├src/
│ └somefile.ts
├test/
│ └some.test.ts
├benchmark/
│ └my.benchmark.ts
├package.json
├zakzak.config.json
└tsconfig.json
```

Create a `my.benchmark.ts` in the `benchmark` folder and copy this code.

```ts
import { benchmark } from "@dynatrace/zakzak";

obj = { a: 28, b: 82, c: "hello", d: 983, e: "foo", o: "key", f: "bar", g: 8 };
key = "key";
benchmark("useHasOwnProperty", () => {
  return obj.hasOwnProperty(key);
});
```

Then we have to make some changes to `"path"` in `zakzak.config.json`. It should point to your build folder, where the transpiled \*.js files are located.

```json
{
  ...
  "path":"./build/",
  ...
}
```

Now you just have to build the `*.benchmark.ts` files and make sure they are in the specified directory. After that you can run `zakzak` and it should execute your benchmark.

That's it. Now you have your first benchmark running.
