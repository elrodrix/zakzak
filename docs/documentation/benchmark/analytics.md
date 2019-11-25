---
id: analytics
title: Analytics
---

```ts
export class Analytics {
  ...
}
```

The `Analytics` class is a wrapper for a couple of mathematical and statistical calculations.
It's purpose is to evaluate a set of samples and return some meaningful numbers.

## Public

### reduceUncertainty

```ts
public static reduceUncertainty(smallestMeasure: number, fractionOfUncertainty: number): number
```

This method calculates the time needed to decrease the uncertainty of a measurement to certain fraction and returns it.
The smallest measurement is the resolution of your timer in `ns` and the fraction is a number from 0.0 - 1.0.
This might sound a bit technical and complicated, but it's actually fairly simple.

Most measuring devices have a smallest unit or value that they can measure. Everything smaller than this value, cannot be accurately measured, thus being uncertain. Let's say the Node.js high resolution timer can only measure timespans longer than 100ns. This means, that every measurement will always have 50ns of uncertainty. Any measurement could be 50ns faster or slower than the timer measured. If we now measure something with 50ns, there is no way of saying how fast it was, it could be anywhere between 0-100ns fast.

To still be able to measure stuff that is smaller than the uncertainty range, we use a statistical trick. By executing the code a fixed amount of times and measuring the total time for all executions, we take up more time and reduce the uncertainty to a smaller percentage, thus being more accurate.

_Example:_

We already know the smallest measurement our timer can make is 5ns. The uncertainty is that smallest measurement divided by 2 => 2.5ns.
The goal is to decrease the uncertainty to 1 percent of the measurement.
So we have to measure something that takes long enough for the uncertainty to be a certain fraction of it.

```text
2.5ns / 0.01 = 250ns
```

Now we know that whatever we measure, if we want max 1% uncertainty, it has to repeat itself often enough to take longer than 250ns.

### getFullAnalysis

```ts
public static getFullAnalysis(samples: number[]): FullAnalysis
```

Runs all the analytic calculations on a set of samples and returns them.
Samples are measurements taken in `ns`.

### getMin

```ts
public static getMin(samples: number[]): number
```

Returns the smallest measurement in a set of samples.

### getMax

```ts
public static getMax(samples: number[]): number
```

Returns the biggest measurement in a set of samples.

### getMarginOfError

```ts
public static getMarginOfError(samples: number[], confidence: ConfidenceLevel = 99): number
```

Calculates the [margin of error](https://www.statisticshowto.datasciencecentral.com/probability-and-statistics/hypothesis-testing/margin-of-error/)
from a set of samples using the [sample standard error](https://www.radford.edu/~biol-web/stats/standarderrorcalc.pdf)
and the [T-score](http://www.sjsu.edu/faculty/gerstman/StatPrimer/t-table.pdf) inferred from the confidence level.

### getStandardDeviation

```ts
public static getStandardDeviation(samples: number[]): number
```

Calculates the [standard deviation](https://www.radford.edu/~biol-web/stats/standarderrorcalc.pdf) of a set of samples.

### getStandardError

```ts
public static getStandardError(samples: number[]): number
```

Calculates the [sample standard error](https://www.radford.edu/~biol-web/stats/standarderrorcalc.pdf) of a set of samples.

### getMean

```ts
public static getMean(samples: number[]): number
```

Calculates the mean of a set of samples.

### getMode

```ts
public static getMode(samples: number[]): number
```

Calculates the [mode](<https://en.wikipedia.org/wiki/Mode_(statistics)>) for a batch of samples.
The mode is the most common value in a list of numbers.
Floating point values will be rounded, as the mode can only be calculated for integers.
Especially useful with small measurements.

### getMedian

```ts
public static getMedian(samples: number[]): number
```

Calculates the median of a set of samples

## Private

### getTScore

```ts
private static getTScore(samples: number[], confidence: ConfidenceLevel)
```

Returns the t-score for a batch of samples and confidence level, by using a table of t-scores.

### tTable

```ts
private static tTable: {
    df: number;
    tValues: number[];
}[]
```

Table containing t-scores, ordered by degrees of freedom and then by confidence level.

## Other exports

### ConfidenceLevel

```ts
export type ConfidenceLevel = 0 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 | 99.8 | 99.9;
```

Possible confidence levels for the t-scores

### FullAnalysis

```ts
export interface FullAnalysis {
  min: number;
  max: number;
  marginOfError: number;
  standardDeviation: number;
  standardError: number;
  mean: number;
  mode: number;
  median: number;
}
```
