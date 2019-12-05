export default class BenchmarkError extends Error {
  childStack: string;

  constructor(errorMessage: string) {
    // const lines = errorMessage.split("\n");
    super(errorMessage);
    this.name = "BenchmarkError";
  }
}
