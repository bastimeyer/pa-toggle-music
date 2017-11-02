import { Buffer } from "buffer";
import { spawn } from "child_process";
import {
	setTimeout,
	clearTimeout
} from "timers";


const KILL_TIMEOUT = 4096;


export default async function( exec, params ) {
	let child;
	let buffer = Buffer.from( "" );
	let timeout;
	try {
		return await new Promise( ( resolve, reject ) => {
			child = spawn( exec, params );
			child.once( "error", reject );
			child.once( "exit", code => code === 0
				? resolve( buffer.toString() )
				: reject( new Error( `Process exited with code ${code}` ) )
			);
			child.stdout.on( "data", chunk =>
				buffer = Buffer.concat([ buffer, chunk ])
			);
			timeout = setTimeout( () => child.kill(), KILL_TIMEOUT );
		});
	} finally {
		if ( timeout ) {
			clearTimeout( timeout );
			timeout = null;
		}
		if ( !child.killed ) {
			child.kill();
		}
	}
}
