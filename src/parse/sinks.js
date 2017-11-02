const reSinkData = /\t+/g;


/**
 * @param {string} input
 * @returns {Map}
 */
export default function( input ) {
	const lines = String( input ).split( "\n" );
	lines.pop();

	if ( !lines.length ) {
		throw new Error( "Missing sinks output" );
	}

	const sinks = new Map();

	for ( const line of lines ) {
		let [ id, name, driver, sample, status ] = line.split( reSinkData );
		id = Number( id );
		if ( isNaN( id ) ) {
			throw new Error( "Unexpected sinks output" );
		}
		sinks.set( id, { name, driver, sample, status } );
	}

	return sinks;
}
