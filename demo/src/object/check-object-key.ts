export default class CheckObjectKey {
  static inIterator(obj: Record<string, any>, key: string) {
    return key in obj;
  }

  static tripleEqualUndefined(obj: Record<string, any>, key: string) {
    return (obj as { [key: string]: any })[key] !== undefined;
  }

  static useHasOwnProperty(obj: Record<string, any>, key: string) {
    // eslint-disable-next-line no-prototype-builtins
    return obj.hasOwnProperty(key);
  }
}
