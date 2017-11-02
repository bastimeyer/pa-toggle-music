import { stat as fsStat } from "fs";
import {
	join,
	delimiter
} from "path";
import denodify from "./denodify";


const paths = process.env.PATH.split( delimiter );
const stat = denodify( fsStat );


/**
 * @param {Stats} stats
 * @returns {boolean}
 */
export function isExecutable( stats ) {
	return stats.isFile() && ( stats.mode & 0o111 ) > 0;
}


/**
 * Resolve simple global executable names
 * @param {string} exec
 * @returns {Promise<string>}
 */
export default async function( exec ) {
	for ( const path of paths ) {
		try {
			const resolvedPath = join( path, exec );
			const stats = await stat( resolvedPath );
			if ( isExecutable( stats ) ) {
				return resolvedPath;
			}
		} catch ( e ) {}
	}
	throw new Error( `Could not resolve "${exec}"` );
}
