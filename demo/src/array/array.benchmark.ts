import { suite, benchmark, setup } from "@dynatrace/zakzak";
import CopyArray from "./copy-array";
import EmptyArray from "./empty-array";

suite("array", () => {
  let array: number[];
  setup(() => {
    array = Array(1000)
      .fill(1)
      .map(() => Math.random());
  });
  suite("copy-array", () => {
    suite("lodash", () => {
      benchmark("clone", () => {
        return CopyArray.lodashClone(array);
      });
    });
    benchmark("apply", () => {
      return CopyArray.apply(array);
    });
    benchmark("concat", () => {
      return CopyArray.concat(array);
    });
    benchmark("index", () => {
      return CopyArray.index(array);
    });
    benchmark("jsonStringify", () => {
      return CopyArray.jsonStringify(array);
    });
    benchmark("map", () => {
      return CopyArray.map(array);
    });
    benchmark("push", () => {
      return CopyArray.push(array);
    });
    benchmark("slice", () => {
      return CopyArray.slice(array);
    });
    benchmark("unshift", () => {
      return CopyArray.unshift(array);
    });
  });
  suite("empty-array", () => {
    benchmark("length0", () => {
      return EmptyArray.length0(array);
    });
    benchmark("newInit", () => {
      return EmptyArray.newInit(array);
    });
    benchmark("pop", () => {
      return EmptyArray.pop(array);
    });
    benchmark("shift", () => {
      return EmptyArray.shift(array);
    });
    benchmark("splice", () => {
      return EmptyArray.splice(array);
    });
  });
});
