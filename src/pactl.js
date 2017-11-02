import spawn from "./spawn";
import parseSinks from "./parse/sinks";
import parseSinkInputs from "./parse/sink-inputs";


/**
 * Get all available sinks
 * @param {string} pactl
 * @returns {Promise.<Map>}
 */
export async function getSinks( pactl ) {
	const sinks = parseSinks( await spawn( pactl, [ "list", "short", "sinks" ] ) );
	if ( !sinks.size ) {
		throw new Error( "No sinks found" );
	}

	return sinks;
}


/**
 * Get all available sink inputs
 * @param {string} pactl
 * @returns {Promise.<Map>}
 */
export async function getSinkInputs( pactl ) {
	const inputs = parseSinkInputs( await spawn( pactl, [ "list", "sink-inputs" ] ) );
	if ( !inputs.size ) {
		throw new Error( "No sink inputs found" );
	}

	return inputs;
}


/**
 * @param {string} pactl
 * @param {number} inputId
 * @param {number} targetSinkId
 * @returns {Promise}
 */
export async function moveSinkInput( pactl, inputId, targetSinkId ) {
	await spawn( pactl, [ "move-sink-input", inputId, targetSinkId ] );
}
