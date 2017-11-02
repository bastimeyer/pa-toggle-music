import which from "./which";
import {
	getSinks,
	getSinkInputs,
	moveSinkInput
} from "./pactl";


const MEDIA_ROLE = "music";

const { hasOwnProperty } = {};


/**
 * @param {Object} input
 * @param {Object} [input.Properties]
 * @param {string} [appName]
 * @returns {boolean}
 */
export function matches( input, appName ) {
	if ( !hasOwnProperty.call( input, "Properties" ) ) {
		return false;
	}
	if ( appName ) {
		return appName === input[ "Properties" ][ "application.name" ];
	} else {
		return MEDIA_ROLE === input[ "Properties" ][ "media.role" ];
	}
}


export function getSinkIdByName( sinks, sinkName ) {
	// find the sink ID by name
	for ( const [ id, { name } ] of sinks ) {
		if ( name === sinkName ) {
			return id;
		}
	}

	throw new Error( `Unknown sink name "${sinkName}"` );
}


export function getNextSinkId( sinks, input ) {
	const sinkIDs = Array.from( sinks.keys() );

	if ( !hasOwnProperty.call( input, "Sink" ) ) {
		throw new Error( "Missing sink info" );
	}

	const sinkID = Number( input[ "Sink" ] );
	if ( isNaN( sinkID ) ) {
		throw new Error( "Invalid sink number" );
	}

	const sinkIndex = sinkIDs.indexOf( sinkID );
	if ( sinkIndex === -1 ) {
		throw new Error( "Unknown sink number of sink input" );
	}

	return sinkIDs[ ( sinkIndex + 1 ) % sinkIDs.length ];
}


/**
 * @param {string} [appName]
 * @param {string} [newSinkName]
 * @returns {Promise}
 */
export default async function( appName, newSinkName ) {
	const pactl = await which( "pactl" );
	const sinks = await getSinks( pactl );
	const inputs = await getSinkInputs( pactl );

	for ( const [ inputId, input ] of inputs ) {
		// only move the sink input matching the application name or media role
		if ( !matches( input, appName ) ) {
			continue;
		}

		// get the new sink ID by name or use the next sink if no name was set
		const targetSinkId = newSinkName
			? getSinkIdByName( sinks, newSinkName )
			: getNextSinkId( sinks, input );

		// move sink input to new sink and resolve
		await moveSinkInput( pactl, inputId, targetSinkId );

		// resolve
		return;
	}

	if ( appName ) {
		throw new Error( `Could not find any sink input with application name "${appName}"` );
	} else {
		throw new Error( `Could not find any sink input with media role "${MEDIA_ROLE}"` );
	}
}
