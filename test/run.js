import test from "ava";
import proxyquire from "proxyquire";


test( "matches", t => {

	const { matches } = require( "../src/run" );

	t.false( matches( {} ) );
	t.false( matches( { "Properties": {} } ) );
	t.false( matches( { "Properties": { "application.name": "foo" } } ) );
	t.true( matches( { "Properties": { "application.name": "foo" } }, "foo" ) );

	t.false( matches( { "Properties": { "media.role": "foo" } } ) );
	t.false( matches( { "Properties": { "media.role": "music" } }, "music" ) );
	t.true( matches( { "Properties": { "media.role": "music" } } ) );

});


test( "getSinkIdByName", t => {

	const { getSinkIdByName } = require( "../src/run" );
	const s = new Map([
		[ 1, { name: "foo" } ],
		[ 2, { name: "bar" } ],
		[ 3, { name: "baz" } ]
	]);

	t.throws( () => getSinkIdByName( s, "qux" ), Error, "Unknown sink name \"qux\"" );
	t.is( getSinkIdByName( s, "foo" ), 1 );
	t.is( getSinkIdByName( s, "bar" ), 2 );
	t.is( getSinkIdByName( s, "baz" ), 3 );

});


test( "getNextSinkId", t => {

	const { getNextSinkId } = require( "../src/run" );
	const s = new Map([
		[ 1, { name: "foo" } ],
		[ 2, { name: "bar" } ],
		[ 3, { name: "baz" } ]
	]);

	t.throws( () => getNextSinkId( s, {} ), Error, "Missing sink info" );
	t.throws( () => getNextSinkId( s, { Sink: "foo" } ), Error, "Invalid sink number" );
	t.throws( () => getNextSinkId( s, { Sink: 4 } ), Error, "Unknown sink number of sink input" );
	t.is( getNextSinkId( s, { Sink: 1 } ), 2 );
	t.is( getNextSinkId( s, { Sink: 2 } ), 3 );
	t.is( getNextSinkId( s, { Sink: 3 } ), 1 );

});


test( "Rejects if pactl lookup doesn't resolve", async t => {

	t.plan( 2 );

	const { default: run } = proxyquire( "../src/run", {
		"./which": {
			async default( cmd ) {
				t.is( cmd, "pactl" );
				throw new Error( "failed" );
			}
		},
		"./pactl": {}
	});

	await t.throws( run(), Error, "failed" );

});


test( "Rejects on invalid sinks output", async t => {

	t.plan( 3 );

	const { default: run } = proxyquire( "../src/run", {
		"./which": {
			async default( cmd ) {
				t.is( cmd, "pactl" );
				return "/usr/bin/pactl";
			}
		},
		"./pactl": {
			async getSinks( cmd ) {
				t.is( cmd, "/usr/bin/pactl" );
				throw new Error( "failed" );
			}
		}
	});

	await t.throws( run(), Error, "failed" );

});


test( "Rejects on invalid sink inputs output", async t => {

	t.plan( 4 );

	const { default: run } = proxyquire( "../src/run", {
		"./which": {
			async default( cmd ) {
				t.is( cmd, "pactl" );
				return "/usr/bin/pactl";
			}
		},
		"./pactl": {
			async getSinks( cmd ) {
				t.is( cmd, "/usr/bin/pactl" );
			},
			async getSinkInputs( cmd ) {
				t.is( cmd, "/usr/bin/pactl" );
				throw new Error( "failed" );
			}
		}
	});

	await t.throws( run(), Error, "failed" );

});


test( "Rejects if no sink input matches", async t => {

	t.plan( 8 );

	const sinks = new Map([
		[ 1, { name: "foo" } ],
		[ 2, { name: "bar" } ],
		[ 3, { name: "baz" } ]
	]);

	const inputs = new Map([
		[ 1, { Sink: 1, Properties: {} } ],
		[ 2, { Sink: 2, Properties: { "application.name": "other-app" } } ],
		[ 3, { Sink: 3, Properties: { "media.role": "no-music" } } ]
	]);

	const { default: run } = proxyquire( "../src/run", {
		"./which": {
			async default( cmd ) {
				t.is( cmd, "pactl" );
				return "/usr/bin/pactl";
			}
		},
		"./pactl": {
			async getSinks( cmd ) {
				t.is( cmd, "/usr/bin/pactl" );
				return sinks;
			},
			async getSinkInputs( cmd ) {
				t.is( cmd, "/usr/bin/pactl" );
				return inputs;
			}
		}
	});

	await t.throws(
		run( "my-app" ),
		Error,
		"Could not find any sink input with application name \"my-app\""
	);
	await t.throws(
		run(),
		Error,
		"Could not find any sink input with media role \"music\""
	);

});


test( "Resolves and sets new sink IDs of matching sink inputs", async t => {

	t.plan( 48 );

	let expected;

	const sinks = new Map([
		[ 1, { name: "foo" } ],
		[ 2, { name: "bar" } ],
		[ 3, { name: "baz" } ]
	]);

	const inputs = new Map([
		[ 1, { Sink: 1, Properties: {} } ],
		[ 2, { Sink: 2, Properties: { "application.name": "my-app" } } ],
		[ 3, { Sink: 3, Properties: { "media.role": "music" } } ]
	]);

	const { default: run } = proxyquire( "../src/run", {
		"./which": {
			async default( cmd ) {
				t.is( cmd, "pactl" );
				return "/usr/bin/pactl";
			}
		},
		"./pactl": {
			async getSinks( cmd ) {
				t.is( cmd, "/usr/bin/pactl" );
				return sinks;
			},
			async getSinkInputs( cmd ) {
				t.is( cmd, "/usr/bin/pactl" );
				return inputs;
			},
			async moveSinkInput( cmd, inputId, targetSinkId ) {
				t.is( cmd, "/usr/bin/pactl" );
				t.is( inputId, expected[0] );
				t.is( targetSinkId, expected[1] );
			}
		}
	});

	expected = [ 2, 3 ];
	await run( "my-app" );

	expected = [ 2, 1 ];
	await run( "my-app", "foo" );

	expected = [ 2, 2 ];
	await run( "my-app", "bar" );

	expected = [ 2, 3 ];
	await run( "my-app", "baz" );

	expected = [ 3, 1 ];
	await run( "" );

	expected = [ 3, 1 ];
	await run( "", "foo" );

	expected = [ 3, 2 ];
	await run( "", "bar" );

	expected = [ 3, 3 ];
	await run( "", "baz" );

});
