function disableJITForFunction(fn){
    %NeverOptimizeFunction(fn);
}

exports.disableJITForFunction = disableJITForFunction