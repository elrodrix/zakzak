import _ from "lodash";

export function median(array: number[]) {
    let sorted = array.sort();
    if (sorted.length % 2 === 0) { // array with even number elements
        return (sorted[sorted.length / 2] + sorted[(sorted.length / 2) - 1]) / 2;
    }
    else {
        return sorted[(sorted.length - 1) / 2]; // array with odd number elements
    }
}

const zScores = {
    "80": 1.28,
    "85": 1.44,
    "90": 1.65,
    "95": 1.96,
    "99": 2.58,
}

export function marginOfError(values: number[], confidenceLevel: 80 | 85 | 90 | 95 | 99 = 95) {
    const mean = _.mean(values);
    const sqrErrSum = _.sumBy(values, (t) => (t - mean) ** 2);
    const avgSqrErr = sqrErrSum / values.length;
    const popStdDev = Math.sqrt(avgSqrErr);
    const moe = (popStdDev / Math.sqrt(values.length)) * zScores[confidenceLevel];

    return moe;
}