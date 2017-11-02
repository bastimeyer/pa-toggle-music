import test from "ava";
import parseSinks from "../../src/parse/sinks";


test( "Throws on invalid input", t => {

	t.throws( () => {
		parseSinks( "" );
	}, Error, "Missing sinks output" );

	t.throws( () => {
		parseSinks( "foo\n" );
	}, Error, "Unexpected sinks output" );

	t.throws( () => {
		parseSinks( "0\tfoo\tbar\tbaz\tqux\nfoo\n" );
	}, Error, "Unexpected sinks output" );

});


test( "Parses output", t => {

	const parsed = parseSinks([
		"0\tfoo\tbar\tbaz\tqux",
		"1\t\tFOO\t\tBAR\t\tBAZ\t\tQUX",
		""
	].join( "\n" ) );

	t.is( parsed.size, 2 );
	t.deepEqual( Array.from( parsed.keys() ), [ 0, 1 ] );
	t.deepEqual( parsed.get( 0 ), { name: "foo", driver: "bar", sample: "baz", status: "qux" } );
	t.deepEqual( parsed.get( 1 ), { name: "FOO", driver: "BAR", sample: "BAZ", status: "QUX" } );

});
