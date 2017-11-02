import test from "ava";
import proxyquire from "proxyquire";


test( "getSinks", async t => {

	t.plan( 13 );

	let fail = true;
	let parsed = new Map();

	const { getSinks } = proxyquire( "../src/pactl", {
		"./spawn": {
			async default( cmd, [ a, b, c ] ) {
				if ( fail ) {
					throw new Error( "failed" );
				}
				t.is( cmd, "/usr/bin/pactl" );
				t.is( a, "list" );
				t.is( b, "short" );
				t.is( c, "sinks" );
				return "content";
			}
		},
		"./parse/sinks": {
			default( content ) {
				t.is( content, "content" );
				return parsed;
			}
		},
		"./parse/sink-inputs": {}
	});

	await t.throws( getSinks(), Error, "failed" );

	fail = false;
	await t.throws( getSinks( "/usr/bin/pactl" ), Error, "No sinks found" );

	parsed.set( 1, { name: "foo" } );
	t.is( await getSinks( "/usr/bin/pactl" ), parsed );

});


test( "getSinkInputs", async t => {

	t.plan( 11 );

	let fail = true;
	let parsed = new Map();

	const { getSinkInputs } = proxyquire( "../src/pactl", {
		"./spawn": {
			async default( cmd, [ a, b ] ) {
				if ( fail ) {
					throw new Error( "failed" );
				}
				t.is( cmd, "/usr/bin/pactl" );
				t.is( a, "list" );
				t.is( b, "sink-inputs" );
				return "content";
			}
		},
		"./parse/sink-inputs": {
			default( content ) {
				t.is( content, "content" );
				return parsed;
			}
		},
		"./parse/sinks": {}
	});

	await t.throws( getSinkInputs(), Error, "failed" );

	fail = false;
	await t.throws( getSinkInputs( "/usr/bin/pactl" ), Error, "No sink inputs found" );

	parsed.set( 1, { Sink: 1 } );
	t.is( await getSinkInputs( "/usr/bin/pactl" ), parsed );

});


test( "moveSinkInput", async t => {

	t.plan( 5 );

	let fail = true;

	const { moveSinkInput } = proxyquire( "../src/pactl", {
		"./spawn": {
			async default( cmd, [ a, b, c ] ) {
				if ( fail ) {
					throw new Error( "failed" );
				}
				t.is( cmd, "/usr/bin/pactl" );
				t.is( a, "move-sink-input" );
				t.is( b, 1 );
				t.is( c, 2 );
			}
		},
		"./parse/sink-inputs": {},
		"./parse/sinks": {}
	});

	await t.throws( moveSinkInput(), Error, "failed" );

	fail = false;
	await moveSinkInput( "/usr/bin/pactl", 1, 2 );

});
