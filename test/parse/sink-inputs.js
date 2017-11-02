import test from "ava";
import parseSinkInputs from "../../src/parse/sink-inputs";


test( "Throws on missing input", t => {

	t.throws( () => {
		parseSinkInputs( "" );
	}, Error, "Missing sink inputs output" );

});


test( "Throws on invalid input", t => {

	t.throws( () => {
		const input = `
foo: bar
`;
		parseSinkInputs( input );
	}, Error, "Invalid sink inputs output at: foo: bar" );

	t.throws( () => {
		const input = `
Sink Input #1
	foo
`;
		parseSinkInputs( input );
	}, Error, "Invalid sink inputs output at: \tfoo" );

	t.throws( () => {
		const input = `
Sink Input #1
		foo: bar
`;
		parseSinkInputs( input );
	}, Error, "Invalid sink inputs output at: \t\tfoo: bar" );

	t.throws( () => {
		const input = `
Sink Input #1
	    foo: bar
`;
		parseSinkInputs( input );
	}, Error, "Invalid sink inputs output at: \t    foo: bar" );

	t.throws( () => {
		const input = `
Sink Input #1
	foo: bar
		bar: baz
`;
		parseSinkInputs( input );
	}, Error, "Invalid sink inputs output at: \t\tbar: baz" );

	t.throws( () => {
		const input = `
Sink Input #1
	foo = "bar"
`;
		parseSinkInputs( input );
	}, Error, "Invalid sink inputs output at: \tfoo = \"bar\"" );

});


test( "Resolves", t => {

	const input = `
Sink Input #1
	foo: bar
	baz: qux
	foo bar: foo:bar:baz:qux

Sink Input #2
	foo: foo
	     bar
	bar: foo
	     bar
	     baz

Sink Input #3
	foo:
		foo.bar = "baz"
		foo.bar.baz = "qux"
	bar:
		baz:
			foo.bar = "baz"
			foo.bar.baz = "qux"

Sink Input #4
	foo: bar
	foo bar: foo:bar:baz:qux
	bar: foo
	     bar
	     baz
	baz:
		qux:
			foo.bar = "baz"
			foo.bar.baz = "qux"
`;

	const parsed = parseSinkInputs( input );

	t.is( parsed.size, 4 );
	t.deepEqual( Array.from( parsed.keys() ), [ 1, 2, 3, 4 ] );
	t.deepEqual( parsed.get( 1 ), {
		foo: "bar",
		baz: "qux",
		"foo bar": "foo:bar:baz:qux"
	});
	t.deepEqual( parsed.get( 2 ), {
		foo: [ "foo", "bar" ],
		bar: [ "foo", "bar", "baz" ]
	});
	t.deepEqual( parsed.get( 3 ), {
		foo: {
			"foo.bar": "baz",
			"foo.bar.baz": "qux"
		},
		bar: {
			baz: {
				"foo.bar": "baz",
				"foo.bar.baz": "qux"
			}
		}
	});
	t.deepEqual( parsed.get( 4 ), {
		foo: "bar",
		"foo bar": "foo:bar:baz:qux",
		bar: [ "foo", "bar", "baz" ],
		baz: {
			qux: {
				"foo.bar": "baz",
				"foo.bar.baz": "qux"
			}
		}
	});

});
