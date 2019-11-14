export default class EmptyArray {
  static length0(arr: number[]) {
    // eslint-disable-next-line no-param-reassign
    arr.length = 0;
  }

  static pop(arr: number[]) {
    while (arr.length > 0) {
      arr.pop();
    }
  }

  static splice(arr: number[]) {
    arr.splice(0, arr.length);
  }

  static shift(arr: number[]) {
    while (arr.length > 0) {
      arr.shift();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static newInit(arr: number[]) {
    // eslint-disable-next-line no-param-reassign
    arr = [];
  }
}
