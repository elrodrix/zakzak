export function median(array: number[]) {
    let sorted = array.sort();
    if (sorted.length % 2 === 0) { // array with even number elements
        return (sorted[sorted.length / 2] + sorted[(sorted.length / 2) - 1]) / 2;
    }
    else {
        return sorted[(sorted.length - 1) / 2]; // array with odd number elements
    }
}