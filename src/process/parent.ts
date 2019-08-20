import ChildProcess from "child_process";

var options: { someData: object , fn: Function | string} = {
    someData: { a: 1, b: 2, c: 3 },
    fn: function (x: number) {
        let a = x;
        let b = Math.random();
        a += b;
        return a;
    }
};
options.fn = options.fn.toString();

export function Parent() {
    var child = ChildProcess.fork(__dirname+'/child',[],{execArgv:["--allow-natives-syntax"]});
    child.send({
        options: options
    });
    child.on('message', function (data) {
        console.log(data)
        child.kill();
    });
}