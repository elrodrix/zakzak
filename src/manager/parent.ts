import ChildProcess from "child_process";

export interface ChildProcessOptions {
	name?: string;
}

export function startChildProcess(filename: string, commandLineArgs: string[], options?: ChildProcessOptions) {
	const child = ChildProcess.fork(filename, commandLineArgs, { execArgv: ["--allow-natives-syntax"] });
	child.send(options);
	child.on("message", (msg) => {
		console.log(msg);
		child.kill();
	});
}
