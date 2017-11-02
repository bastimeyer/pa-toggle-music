/**
 * @param {Function} func
 * @param {Object} [fnContext]
 * @returns {function(...[*])}
 */
export default function( func, fnContext ) {
	return ( ...fnArgs ) => new Promise( ( resolve, reject ) => {
		func.call( fnContext, ...fnArgs, ( ...cbArgs ) => {
			const [ err, value ] = cbArgs;
			if ( err ) {
				reject( err );
			} else {
				resolve( cbArgs.length > 2
					? cbArgs.slice( 1 )
					: value
				);
			}
		});
	});
}
