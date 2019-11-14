import { Exporter, Suite, Benchmark, BenchmarkResult } from "@dynatrace/zakzak";

export default class EmojiExporter extends Exporter {
  // eslint-disable-next-line class-methods-use-this
  onError() {
    console.log("💩  happened");
  }

  onHierarchy(root: Suite[]) {
    this.printLayer(root);
  }

  printLayer(suites: Array<Suite | Benchmark>, indentCount = 0, symbol = "🌳") {
    suites.forEach(s => {
      const indentation = "  ".repeat(indentCount);
      console.log(`${indentation}${symbol} ${s.name}`);
      if (!(s instanceof Benchmark)) {
        this.printLayer(s.children, indentCount + 1, "🍁");
      }
    });
  }

  onResult(result: BenchmarkResult) {
    console.log(`🏎️  ${result.name} has finished: ${result.stats.mean} nanoseconds`);
  }

  onFinished() {
    console.log("\nBenchmarking is done.\n\n👋 Bye Bye👋");
  }
}
