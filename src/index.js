import run from "./run";


run( process.argv[2], process.argv[3] )
	.catch( err => {
		process.stderr.write( `${err.toString()}\n` );
		process.exit( 1 );
	});
