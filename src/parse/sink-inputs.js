const reSinkInputNumber = /^Sink Input #(\d+)$/;
const reSinkInputData = /^(\t+)(?:( +)|([^:]+):\s*)(\S.*)?$/;
const reSinkInputProperties = /^(\t+)(\S+) = "(.+)"$/;


/**
 * @param {string} input
 * @returns {Map}
 */
export default function( input ) {
	const lines = String( input ).split( "\n" );
	lines.pop();

	if ( !lines.length ) {
		throw new Error( "Missing sink inputs output" );
	}

	const inputs = new Map();
	const stack = [];

	let tip;
	let lastkey;

	for ( const line of lines ) {
		if ( !line ) { continue; }

		const indexData = reSinkInputNumber.exec( line );
		if ( indexData !== null ) {
			let [ , index ] = indexData;
			index = Number( index );
			const data = {};
			inputs.set( index, data );
			stack.splice( 0, stack.length );
			stack.push( data );
			tip = data;
			continue;
		}

		const lineData = reSinkInputData.exec( line );
		if ( lineData !== null ) {
			const [ , indent, spaces, key, value ] = lineData;

			if ( indent.length < stack.length ) {
				while ( indent.length < stack.length ) {
					stack.pop();
				}
				tip = stack[ stack.length - 1 ];
			}

			if ( indent.length > stack.length ) {
				throw new Error( `Invalid sink inputs output at: ${line}` );
			}

			if ( !spaces && key ) {
				if ( value ) {
					tip[ key ] = value;
					lastkey = key;
				} else {
					const data = {};
					tip[ key ] = data;
					stack.push( data );
					tip = data;
					lastkey = null;
				}
				continue;
			}
			if ( spaces && lastkey ) {
				if ( !Array.isArray( tip[ lastkey ] ) ) {
					tip[ lastkey ] = [ tip[ lastkey ] ];
				}
				tip[ lastkey ].push( value );
				continue;
			}
		}

		const properties = reSinkInputProperties.exec( line );
		if ( properties !== null && stack.length > 1 ) {
			const [ , , key, value ] = properties;
			tip[ key ] = value;
			continue;
		}

		throw new Error( `Unexpected sink inputs output at: ${line}` );
	}

	return inputs;
}
