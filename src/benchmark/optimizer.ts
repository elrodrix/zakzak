import v8 from "v8";
import vm from "vm";

/**
 * Exposes some native functionalities to get information about optimization.
 */
export default class Optimizer {
  constructor() {
    v8.setFlagsFromString("--allow-natives-syntax");
  }

  /**
   * Return the optimizationstatus of a function
   * The returned number is a bitmap of the different optimization codes or statuses.
   * @param fn Function whose optimization status will be checked
   */
  static getOptimizationStatus(fn: Function): number {
    return vm.runInNewContext("%GetOptimizationStatus(fn)", { fn });
  }

  /**
   * Force the v8 to deoptimize a function
   * @param fn Function that will be deoptimized
   */
  static deoptimizeFunction(fn: Function): void {
    vm.runInNewContext("%DeoptimizeFunction(fn)", { fn });
  }

  /**
   * Signal the v8 to optimize a function.
   * The passed function needs to be called atleast once before calling this function.
   * It then needs to be called again after this function, so that actually gets optimized
   * @param fn Function that will be optimized
   */
  static optimizeFunctionOnNextCall(fn: Function): void {
    vm.runInNewContext("%OptimizeFunctionOnNextCall(fn)", { fn });
  }

  /**
   * Mark a function to never be optimized
   * @param fn Function that will never be optimized
   */
  static neverOptimizeFunction(fn: Function) {
    vm.runInNewContext("%NeverOptimizeFunction(fn)", { fn });
  }
}

/* eslint-disable no-bitwise */
/**
 * Mapping of bitwise values to optimizaton status.
 */
export enum OptimizationStatus {
  IsFunction = 1 << 0,
  NeverOptimized = 1 << 1,
  AlwaysOptimized = 1 << 2,
  MaybeDeoptimized = 1 << 3,
  Optimized = 1 << 4,
  TurboFanned = 1 << 5,
  Interpreted = 1 << 6,
  MarkedForOptimization = 1 << 7,
  MarkedForConcurrentOptimization = 1 << 8,
  OptimizingConcurrently = 1 << 9,
  IsExecuting = 1 << 10,
  TopmostFrameIsTurboFanned = 1 << 11,
}
