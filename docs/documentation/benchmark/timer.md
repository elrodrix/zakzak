---
id: timer
title: Timer
---

```ts
export default class Timer {
  ...
}
```

## Public

### getTime

```ts
public static getTime(unit: TimeUnit = TimeUnit.Nanosecond): number;
```

`unit` is the unit in which to return the time.

Returns the current time. Uses process.hrtime() internally.

### getResolution

```ts
public static getResolution(): number;
```

Returns the resolution of the timer.
The resolution is the smallest possible measurement that the timer can measure.
Works by calling `process.hrtime()` once and repeatedly calling it again until it differs from the first `process.hrtime()`.
This process is repeated and the average of those times is returned.
