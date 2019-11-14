import _ from "lodash";

export default class CopyArray {
  static slice(arr: number[]) {
    return arr.slice();
  }

  static concat(arr: number[]) {
    return ([] as number[]).concat(arr);
  }

  static unshift(arr: number[]) {
    const arr2 = [];
    for (let i = arr.length; i--; ) {
      arr2.unshift(arr[i]);
    }
    return arr2;
  }

  static push(arr: number[]) {
    const arr2 = [];
    for (let i = 0, l = arr.length; i < l; i++) {
      arr2.push(arr[i]);
    }
    return arr2;
  }

  static index(arr: number[]) {
    const arr2 = new Array(arr.length);
    for (let i = 0, l = arr.length; i < l; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }

  static apply(arr: number[]) {
    // eslint-disable-next-line prefer-spread
    return Array.apply(undefined, arr);
  }

  static map(arr: number[]) {
    return arr.map(i => {
      return i;
    });
  }

  static jsonStringify(arr: number[]) {
    return JSON.parse(JSON.stringify(arr));
  }

  static lodashClone(arr: number[]) {
    return _.clone(arr);
  }
}
