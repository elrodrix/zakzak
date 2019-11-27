---
title: How it works
author: Lukas Kurz
authorURL: http://github.com/lukaskurz
authorImageURL: https://avatars1.githubusercontent.com/u/22956519?s=460&v=4
---

Benchmarking can be as easy as calling `new Date()` twice, but an easy solution is not always the best solution.
Zakzak employs a rather complicated procedure for benchmarking, which is also the reason why it is so accurate and consistent.

In this blog post I will discuss how zakzak works internally.

<!--truncate-->

## From the start

The first thing zakzak does, is reading the benchmark files. Using [globby](https://github.com/sindresorhus/globby), which in turn uses [minimatch](https://github.com/isaacs/minimatch), it matches the target files. Then, using `require`, it executes those benchmark files.

_Normally `require` is used to import things exported in other files, but it can also be used to execute code in another js file_

## File parsing

All that the `benchmark`, `suite`, `setup` and `teardown` statements do, is access a singleton object called the `SuiteManager` and register themselves with it. When a statement registers itself with this `SuiteManager`, the manager creates an object for it, containing name, file and, most importantly, the function that was passed as a param to the statement.

Now the `SuiteManager` starts building a tree like structure to represent the hierarchy of the statements in the file. At the topmost level, the root of the tree, is a `Suite` (the object representing a `suite` statement), that was automatically created to represent the file itself. Beneath that root, there is the next level, containg all the registrations from the previous step.

To further "discover" the file, the manager now calls the functions inside the afforementioned registrations. These, in turn, contain more statements, which will again, register themselves with the manager. You can see where this is going. This process is continued until there are no more registrations when calling the functions, at which point the file is considered done and the next file is processed.

## Many childprocesses

Once all the benchmarks are discovered, a different manager, called the `BenchmarkManager`, now creates little wrapper objects for the benchmarks. Those wrappers' purpose is to start a child process for the benchmark they are containing and interchanging information between child and parent process.

The reason why the benchmarks are executed in child process, instead of the parent process is to isolate their environment. During development, I noticed, that if I were to executed multiple benchmarks, the v8 and certain functions would already be warmed up and optimized from the previous benchmark, which affected the results and behaviour.

## Isolation

Normally a function gets called often enough for it to be warmed up and to be optimized by the v8. Zakzak dynamically evaluates how often it has to execute a function until it is at peak performance, ready to be benchmarked. Now that is, where the problem arises. For example, a function `foobar()` takes 100k executions until it is ready. If however a benchmark was running before, and maybe that benchmark is similar to `foobar`, then the v8 would already be warmed up and some of the functions could still be optimized. `foobar` now only needs 30k executions to be ready, since most of the stuff is already optimized. Zakzak now thinks that it only needs 30k executions, and if, for some reason, the v8 starts deoptimizing stuff because there is a lot of stuff happening between the actual benchmark and the warmup evaluation, it is no longer able to fully warm up `foobar`, thus resulting in less accurate or even wrong results.

Child processes have separate v8 instances and thus dont share the optimized functions. This way, every benchmark has the same environment and the results are more consistent over multiple benchmark runs.

## Warmup

### Dynamic

While other benchmarking frameworks have a more manual approach to benchmarking, this seemed impractical to me.
You would have to specify the warmup count for each benchmark. Furthermore, if due too version change or other factors, the speed of some benchmark changes significantly, you would have to change the warmup count again. Worst case, you might not even notice, you'd just notice that the benchmark results got worse, which is due to being poorly warmed up.

### Timer resolution & Uncertainty

To understand the evaluation process, you first have to understand what a timer resolution is and what uncertainty means.

All measuring devices have a smallest possible value that they can measure. Let's take for example a kitchen scale and say the smallest possible value it can measure is 1g. This means it can only measure in 1g intervals, like 300g, 301g, 302 and so on, but not 300.5g. When the scale now displays 205g for something, the real weight could be anywhere between 204.5g and 205.5g, thus there is a 0.5g uncertainty.

Problems arise when you try to measure something that approaches that resolution and the uncertainty takes up a big fraction of the measurement.
If you were to measure a rice corn with that scale and you got 3g as the weight of the rice corn, then the rice corn's real weight could be anywhere between 2.5g and 3.5g. The uncertainty makes 16% of that measurement.

```text
resolution = 1
uncertainty = resolution / 2
fraction = uncertainty / measurement = 0.5 / 3
fraction => 0.16 => 16 %
```

You can still measure the rice corn accurately with this scale, by employing a simple trick.
Assuming all rice corns weigh nearly the same, you count and put more of them on the scale.
Continuing with the example, you put 100 rice corns on the scale and now it displays 315g.
The uncertainty stays the same, but now it takes up a much smaller fraction of the measurement.
314.5 to 315.5 is now the range for the total weight, divided by the count that's 3.145g to 3.155g or 0.16 %.

```text
resolution = 1
uncertainty = resolution / 2
fraction = uncertainty / measurement = 0.5 / 315
fraction => 0.0016 => 0.16 %
```

The same problem happens with the timer in Node.js. While the HRTimer is pretty accurate, it still pays of to take the uncertainty into account.

We measure the resolution of the HRTimer by taking a timestamp and then repeatedly take new timestamps until the difference between the first and the new timestamp is bigger than 0. We then repeat this process 50 times and take the average of those differences.

```ts
function getResolution() {
  let count = 50;
  const times: number[] = [];
  while (count--) {
    let now;

    /* subtract current time from a fixed time taken beforehand,
    until the difference is no longer 0 ~ false */
    const begin = Timer.getTime();
    while (!(now - begin)) {
      now = Timer.getTime();
    }

    times.push(now - begin);
  }
  return mean(times);
}
```

We aim to have a maximum uncertainty of 1% of the measurement, so if the resolution is 4ns, our measurement has to be atleast 400ns long.
In the code, this number is referred to as the `minTime`. You can also configure a `minTime` in the config. Whichever number is higher, is then used.

### Execution count

The execution count is the amount of times we repeat the code for a single "sample" or "cycle". We calculate the execution count using the `minTime` and an incremental process, that increases the repitions until the duration surpasses `minTime`. We have to consider, that the more often we execute a function, the faster it gets.

The process starts with a single execution. That execution is measured and we estimate how often it would have to be repeated to surpass `minTime`.

```text
minTime = 400ns
count = 1
total = 120ns
timeLeft = minTime - total = 400ns - 120ns => 280ns
avg = total / count = 120ns / 1 => 120ns
target = timeLeft / avg = 280ns / 120ns => 2.33 ~ 3
next = count + target = 1 + 3 => 4
```

We then repeat the process, but this time with 4 executions. The functions starts to warm up and get faster, which might even result in the next run being faster the previous one, due to optimizations having kicked in.

```text
minTime = 400ns
count = 4
total = 140ns
timeLeft = minTime - total => 260ns
avg = total / count => 65ns
target = timeLeft / avg => 4
next = count + target => 8
```

This process is repeated until the `minTime` is reached. The last count is then taken as the needed amount of repitions to warm up the code. This amount, the `executionCount` is also then used as the fixed amount of repitions for taking the samples.

## Taking samples

Warmup is the most complicated thing about zakzak, the actual benchmark measuring is relatively straightforward.
One full cycle of repitions is used as sample.
To increase the accuracy and consistency, we take multiple samples.
Using the configuration you can define a minimum and maximum amount of samples, or a maximum time for zakzak to take samples.

All thats then left to do is export and interpret them.
