import test from "ava";
import proxyquire from "proxyquire";
import { Buffer } from "buffer";
import { EventEmitter } from "events";


class ChildProcess extends EventEmitter {
	constructor() {
		super();
		this.stdout = new EventEmitter();
		this.killed = false;
	}
	kill() {
		this.killed = true;
	}
}


test( "Sets and clears timeout", async t => {

	t.plan( 5 );

	let child;

	const { default: spawn } = proxyquire( "../src/spawn", {
		child_process: {
			spawn() {
				child = new class extends ChildProcess {
					kill() {
						this.killed = true;
						t.pass();
						this.emit( "exit", 0 );
					}
				}();
				return child;
			}
		},
		timers: {
			setTimeout( fn, time ) {
				t.true( fn instanceof Function );
				t.is( time, 4096 );
				process.nextTick( fn );
				return 1234;
			},
			clearTimeout( timeout ) {
				t.is( timeout, 1234 );
			}
		}
	});

	await spawn();
	t.true( child.killed );

});


test( "Rejects on error", async t => {

	t.plan( 2 );

	let child;

	const { default: spawn } = proxyquire( "../src/spawn", {
		child_process: {
			spawn() {
				child = new class extends ChildProcess {
					kill() {
						this.killed = true;
						t.pass();
					}
				}();
				return child;
			}
		}
	});

	const promise = spawn();
	child.emit( "error", new Error( "failed" ) );
	await t.throws( promise, Error, "failed" );

});


test( "Rejects on exit code not equal to zero", async t => {

	t.plan( 2 );

	let child;

	const { default: spawn } = proxyquire( "../src/spawn", {
		child_process: {
			spawn() {
				child = new class extends ChildProcess {
					kill() {
						this.killed = true;
						t.pass();
					}
				}();
				return child;
			}
		}
	});

	const promise = spawn();
	child.emit( "exit", 1 );
	await t.throws( promise, Error, "Process exited with code 1" );

});


test( "Resolves with buffered stdout content", async t => {

	t.plan( 5 );

	let child;

	const { default: spawn } = proxyquire( "../src/spawn", {
		child_process: {
			spawn( exec, [ a, b ] ) {
				t.is( exec, "/foo" );
				t.is( a, "bar" );
				t.is( b, "baz" );
				child = new class extends ChildProcess {
					kill() {
						this.killed = true;
						t.pass();
					}
				}();
				return child;
			}
		}
	});

	const promise = spawn( "/foo", [ "bar", "baz" ] );
	child.stdout.emit( "data", Buffer.from( "foo" ) );
	child.stdout.emit( "data", Buffer.from( "bar" ) );
	child.stdout.emit( "data", Buffer.from( "baz" ) );
	child.emit( "exit", 0 );
	const content = await promise;
	t.is( content, "foobarbaz" );

});
