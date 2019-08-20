import v8natives from "v8-natives";

process.on('message', function (data) {
    var method = data.method;
    var options = data.options;
    var someData = options.someData;
    var fn = new Function('return ' + options.fn)();
    console.log((fn));
    console.log((v8natives.getOptimizationStatus(fn) & (1 << 5)) == (1 << 5));
    for (let i = 0, l = 50000; i < l; i++) {
        fn();
    }
    console.log(v8natives.getOptimizationStatus(fn));
    console.log((v8natives.getOptimizationStatus(fn) & (1 << 5)) == (1 << 5));
    let result = fn(options.someData.a);
    process.send({
        err: "none",
        result: result
    });
});