import test from "ava";
import proxyquire from "proxyquire";


const originalArgv = process.argv;
const originalStderrWrite = process.stderr.write;
const originalExit = process.exit;


test.afterEach( () => {
	process.argv = originalArgv;
	process.stderr.write = originalStderrWrite;
	process.exit = originalExit;
});


test( "Prints errors and exits with code 1", async t => {

	t.plan( 2 );

	process.stderr.write = line => {
		t.is( line, "Error: failed\n" );
	};

	process.exit = code => {
		t.is( code, 1 );
	};

	proxyquire( "../src/index", {
		"./run": {
			async default() {
				throw new Error( "failed" );
			}
		}
	});

});


test( "Uses correct parameters", async t => {

	process.argv = [ "node", "pa-toggle-music", "my-app", "my-sink" ];

	proxyquire( "../src/index", {
		"./run": {
			async default( app, sink ) {
				t.is( app, "my-app" );
				t.is( sink, "my-sink" );
			}
		}
	});

});
