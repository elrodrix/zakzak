import v8natives from "v8-natives";

process.on("message", (msg) => {
	const fn = new Function("return " + msg.fn)();
	console.log((fn));
	console.log((v8natives.getOptimizationStatus(fn) & (1 << 5)) === (1 << 5));
	for (let i = 0, l = 50000; i < l; i++) {
		fn();
	}
	console.log(v8natives.getOptimizationStatus(fn));
	console.log((v8natives.getOptimizationStatus(fn) & (1 << 5)) === (1 << 5));
	fn();
	process.send({
		err: "none",
		result: "nothing"
	});
});
