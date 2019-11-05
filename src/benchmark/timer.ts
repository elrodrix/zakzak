/*!
 * Copyright 2019, Dynatrace LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { mean } from "lodash";

import TimeUnit from "../time";

/**
 * Timer that will be used by the benchmark
 */
export default class Timer {
  /**
   * Gets the current time using the high resolution timer from node, `process.hrtime()`.
   * @param unit Unit in which to return the time. Default is nanosecond
   */
  public static getTime(unit: TimeUnit = TimeUnit.Nanosecond) {
    const time = process.hrtime();
    return (time[0] * TimeUnit.Second + time[1]) / unit;
  }

  /**
   * Calculate the resolution of the timer.
   * The resolution is the smallest possible measurement that the timer can take.
   */
  public static getResolution() {
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
}
