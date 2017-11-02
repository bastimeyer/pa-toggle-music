import test from "ava";
import proxyquire from "proxyquire";


const originalEnv = process.env;
const delimiter = ":";


test.afterEach( () => {
	process.env = originalEnv;
});


test( "isExecutable", t => {

	const { isExecutable } = proxyquire( "../src/which", {
		path: {},
		fs: {
			stat() {}
		}
	});

	t.false( isExecutable({ isFile() { return false; }, mode: 0o111 }) );
	t.false( isExecutable({ isFile() { return true; }, mode: 0o000 }) );
	t.true( isExecutable({ isFile() { return true; }, mode: 0o001 }) );
	t.true( isExecutable({ isFile() { return true; }, mode: 0o010 }) );
	t.true( isExecutable({ isFile() { return true; }, mode: 0o100 }) );
	t.true( isExecutable({ isFile() { return true; }, mode: 0o111 }) );

});


test( "Rejects on fs.stat error", async t => {

	t.plan( 3 );

	process.env.PATH = [ "/foo" ].join( delimiter );
	const expectedJoin = [ "/foo", "bar" ];
	const expectedStat = "/foo/bar";

	const { default: which } = proxyquire( "../src/which", {
		path: {
			delimiter,
			join( ...paths ) {
				t.deepEqual( paths, expectedJoin );
				return paths.join( "/" );
			}
		},
		fs: {
			stat( path, callback ) {
				t.is( path, expectedStat );
				callback( null, new Error( "failed" ) );
			}
		}
	});

	await t.throws( which( "bar" ), Error, "Could not resolve \"bar\"" );

});


test( "Rejects if all files are invalid", async t => {

	t.plan( 5 );

	process.env.PATH = [ "/foo", "/bar" ].join( delimiter );
	const expectedJoin = [ [ "/foo", "baz" ], [ "/bar", "baz" ] ];
	const expectedStat = [ "/foo/baz", "/bar/baz" ];

	const { default: which } = proxyquire( "../src/which", {
		path: {
			delimiter,
			join( ...paths ) {
				t.deepEqual( paths, expectedJoin.shift() );
				return paths.join( "/" );
			}
		},
		fs: {
			stat( path, callback ) {
				t.is( path, expectedStat.shift() );
				callback( null, {
					isFile() {
						return false;
					}
				});
			}
		}
	});

	await t.throws( which( "baz" ), Error, "Could not resolve \"baz\"" );

});


test( "Resolves with first matching executable", async t => {

	t.plan( 5 );

	process.env.PATH = [ "/foo", "/bar", "/baz" ].join( delimiter );
	const expectedJoin = [ [ "/foo", "qux" ], [ "/bar", "qux" ], [ "/baz", "qux" ] ];
	const expectedStat = [ "/foo/qux", "/bar/qux", "/baz/qux" ];

	const { default: which } = proxyquire( "../src/which", {
		path: {
			delimiter,
			join( ...paths ) {
				t.deepEqual( paths, expectedJoin.shift() );
				return paths.join( "/" );
			}
		},
		fs: {
			stat( path, callback ) {
				t.is( path, expectedStat.shift() );
				const isExecutable = path === "/bar/qux";
				callback( null, {
					isFile() {
						return isExecutable;
					},
					mode: isExecutable ? 0o100 : 0o000
				});
			}
		}
	});

	const path = await which( "qux" );
	t.is( path, "/bar/qux" );

});
