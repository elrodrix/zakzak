import _ from "lodash";

export default class IsStringInString {
  static indexOf(haystack: string, needle: string) {
    return haystack.indexOf(needle) !== -1;
  }

  static regex(haystack: string, needle: string) {
    return new RegExp(needle).test(haystack);
  }

  static match(haystack: string, needle: string) {
    return haystack.match(needle) !== null;
  }

  static includes(haystack: string, needle: string) {
    return haystack.includes(needle);
  }

  static search(haystack: string, needle: string) {
    return haystack.search(needle) !== -1;
  }

  static lodashIncludes(haystack: string, needle: string) {
    return _.includes(haystack, needle);
  }
}
