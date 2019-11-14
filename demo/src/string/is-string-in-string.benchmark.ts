import { suite, benchmark, setup } from "@dynatrace/zakzak";
import IsStringInString from "./is-string-in-string";

suite("string", () => {
  suite("is-string-in-string", () => {
    let haystack: string;
    let needle: string;
    setup(() => {
      needle = "literally a needle";
      haystack = `${Math.random()
        .toString()
        .repeat(100)}${needle}${Math.random()
        .toString()
        .repeat(100)}`;
    });
    benchmark("async-es6-includes", () => {
      return IsStringInString.includes(haystack, needle);
    });
    suite("includes", () => {
      benchmark(
        "lodash-includes",
        () => {
          return IsStringInString.lodashIncludes(haystack, needle);
        },
        { minSamples: 2, maxSamples: 10 },
      );
      benchmark("es6-includes", () => {
        return IsStringInString.includes(haystack, needle);
      });
    });
    benchmark("indexOf", () => {
      return IsStringInString.indexOf(haystack, needle);
    });
    benchmark("match", () => {
      return IsStringInString.match(haystack, needle);
    });
    benchmark("regex", () => {
      throw new Error("SomeError");
      // return IsStringInString.regex(haystack, needle);
    });
    benchmark("search", () => {
      return IsStringInString.search(haystack, needle);
    });
  });
});
