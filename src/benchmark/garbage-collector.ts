import v8 from "v8";
import vm from "vm";

/**
 * Wrapper class for the garbage collector
 */
export default class GarbageCollector {
  /**
   * Store the exposed `gc` function
   */
  private static gc = () => {
    console.error("no gc registered");
  };

  /**
   * Init the wrapper by setting the flags to expose the garbage collector and saving it in the class property
   */
  static init() {
    v8.setFlagsFromString("--expose_gc");
    const gc = vm.runInNewContext("gc");
    if (typeof gc === "function") {
      GarbageCollector.gc = gc;
    }
  }

  /**
   * Collect garbage
   */
  public static collect() {
    this.gc();
  }
}
