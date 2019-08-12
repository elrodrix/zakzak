import Benchmark from "./benchmark";
import crypto from "crypto";

const pbkdf2 = () => {
    const key = crypto.pbkdf2Sync("correct horse battery staple", "pepper", 100000, 128, "sha512");
    key.toString("hex");
};

const encAndDec = () => {
    for (let i = 0; i < 1000; i++) {
        let algorithm = 'aes-256-cbc';
        let key = crypto.randomBytes(32);
        let iv = crypto.randomBytes(16);

        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update("protect this text from nsa");
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        iv = Buffer.from(iv.toString('hex'), 'hex');
        let encryptedText = Buffer.from(encrypted.toString('hex'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        decrypted.toString();
    }
};

const rand1k = () => {
    for (var i = 0; i < 1000; ++i) {
        let a;
        let b = Math.random();
        a = b;
    }
};

const rand = () => {
    let a;
    let b = Math.random();
    a = b;
};
const rand128 = () => {
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
    rand();
};

// console.info(`result: ${new Benchmark(rand, "test").run().toFixed(2)}ns`)
// console.info(`result: ${new Benchmark(rand1k, "test").run().toFixed(2)}ns`)
// console.info(`result: ${new Benchmark(encAndDec, "test").run().toFixed(2)}ns`)
// console.info(`result: ${new Benchmark(pbkdf2, "test").run().toFixed(2)}ns`)


console.info(`result: ${new Benchmark(rand, "test").run().toFixed(2)}ns`)
// console.info(`result: ${new Benchmark(rand128, "test").run().toFixed(2)}ns`)
// console.info(`result: ${new Benchmark(rand1k, "test").run().toFixed(2)}ns`)