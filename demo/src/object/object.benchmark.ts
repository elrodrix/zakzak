import { benchmark, suite, setup } from "@dynatrace/zakzak";
import CheckObjectKey from "./check-object-key";

suite("object", () => {
  suite("check-object-key", () => {
    let obj: Record<string, any>;
    let key: string;
    setup(() => {
      obj = { a: 28, b: 82, c: "hello", d: 983, e: "foo", o: "key", f: "bar", g: 8 };
      key = "key";
    });
    benchmark("inIterator", () => {
      return CheckObjectKey.inIterator(obj, key);
    });
    benchmark("tripleEqualUndefined", () => {
      return CheckObjectKey.tripleEqualUndefined(obj, key);
    });
    benchmark("useHasOwnProperty", () => {
      return CheckObjectKey.useHasOwnProperty(obj, key);
    });
  });
});
