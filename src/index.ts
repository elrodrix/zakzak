import crypto from "crypto";
import BenchmarkManager from "./manager/manager";
import _ from "lodash";

const pbkdf2 = () => {
	const key = crypto.pbkdf2Sync("correct horse battery staple", "pepper", 100000, 128, "sha512");
	key.toString("hex");
};

const encAndDec = () => {
	for (let i = 0; i < 1000; i++) {
		const algorithm = "aes-256-cbc";
		const key = crypto.randomBytes(32);
		let iv = crypto.randomBytes(16);

		const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
		let encrypted = cipher.update("protect this text from nsa");
		encrypted = Buffer.concat([encrypted, cipher.final()]);

		iv = Buffer.from(iv.toString("hex"), "hex");
		const encryptedText = Buffer.from(encrypted.toString("hex"), "hex");
		const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		decrypted.toString();
	}
};

const rand1k = () => {
	for (let i = 0; i < 1000; ++i) {
		rand();
	}
};

const rand = () => {
	let a;
	const b = Math.random();
	a = b;
};

const rand2 = () => {
	rand();
	rand();
};

const rand4 = () => {
	rand2();
	rand2();
};

const rand8 = () => {
	rand4();
	rand4();
};

const rand16 = () => {
	rand8();
	rand8();
};

const mng = new BenchmarkManager();
mng
	.add("rand(jit)", rand, { allowJIT: true })
	// .add("rand(jit)", rand, { allowJIT: true })
	// .add("rand(jit)", rand, { allowJIT: true })
	// .add("rand(no-jit)", rand, { allowJIT: false })
	// .add("rand(no-jit)", rand, { allowJIT: false })
	// .add("rand(no-jit)", rand, { allowJIT: false })
	// .add("rand2", rand2, { allowJIT: false })
	// .add("rand4", rand4)
	// .add("rand8", rand8)
	// .add("rand16", rand16)
	// .add("rand1k", rand1k)
	.run();
