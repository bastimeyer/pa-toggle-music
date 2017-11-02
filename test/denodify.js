import test from "ava";
import denodify from "../src/denodify";


test( "Rejects on thrown error", async t => {

	const nodeFunction = ( a, b ) => {
		t.is( a, 1 );
		t.is( b, 2 );
		throw new Error( "failed" );
	};

	const fn = denodify( nodeFunction );
	const promise = fn( 1, 2 );
	t.true( promise instanceof Promise );
	await t.throws( promise, Error, "failed" );

});


test( "Rejects on returned error", async t => {

	const nodeFunction = ( a, b, c ) => {
		t.is( a, 1 );
		t.is( b, 2 );
		c( new Error( "failed" ) );
	};

	const fn = denodify( nodeFunction );
	const promise = fn( 1, 2 );
	t.true( promise instanceof Promise );
	await t.throws( promise, Error, "failed" );

});


test( "Resolves with single value", async t => {

	const nodeFunction = ( a, b, c ) => {
		t.is( a, 1 );
		t.is( b, 2 );
		c( null, 3 );
	};

	const fn = denodify( nodeFunction );
	const promise = fn( 1, 2 );
	t.true( promise instanceof Promise );
	const a = await promise;
	t.is( a, 3 );

});


test( "Resolves with multiple values", async t => {

	const nodeFunction = ( a, b, c ) => {
		t.is( a, 1 );
		t.is( b, 2 );
		c( null, 3, 4 );
	};

	const fn = denodify( nodeFunction );
	const promise = fn( 1, 2 );
	t.true( promise instanceof Promise );
	const [ a, b ] = await promise;
	t.is( a, 3 );
	t.is( b, 4 );

});


test( "Context", async t => {

	const context = {};

	const nodeFunction = function( a, b, c ) {
		t.is( a, 1 );
		t.is( b, 2 );
		t.is( this, context );
		c( null );
	};

	const fn = denodify( nodeFunction, context );

	await fn( 1, 2 );
	await fn.call( {}, 1, 2 );

});
