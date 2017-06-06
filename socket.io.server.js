// GameLoop prototype used for creating gameloops for each full room
var GameLoop = require('./app/gameloop');
/**
 * Maps room to array of connected socket objects and gameloop object
 * { roomId : { sockets : [ socketObj1, socketObj2 ] }, gameloop : GameLoop {} } 
 */
var roomSockets = {};


exports.run = function(server) {

	// create socket.io server
	io = require('socket.io')(server);

	// individual connection handler
	io.on('connection', function(socket) {
		
		// extract roomId from referer URL
		var referer = socket.client.request.headers.referer;
		var roomId = referer.substring(nthIndex(referer, '/room/', 1)+6, referer.length);

		console.log('[socket.io] ' + socket.handshake.address + ' connected to room ' + roomId);

		// join socket to specified roomId. starts gameloop if room is full after join
		socket.join(roomId, function() {
			// add socket object to roomSockets dict
			if (roomSockets[roomId] === undefined) {
				roomSockets[roomId] = {};
				roomSockets[roomId].sockets = [];
			}
			roomSockets[roomId].sockets.push(socket);

			// create and instantiate gameloop object if room is full
			if (Object.keys(io.sockets.adapter.rooms[roomId].sockets).length === 2) {
				roomSockets[roomId].gameloop = new GameLoop(roomSockets[roomId].sockets, roomId);
				roomSockets[roomId].gameloop.start();
			}
		}); // end socket join

		// disconnect listener
		socket.on('disconnect', function(message) {
			// kill recursive game loop upon disconnect
			if (roomSockets[roomId].sockets.length === 2)
				roomSockets[roomId].gameloop.stop(roomSockets[roomId].sockets);

			// remove socket from room dict
			roomSockets[roomId].sockets.splice(roomSockets[roomId].sockets.indexOf(socket), 1);

			// removes room from dict if empty
			if (roomSockets[roomId].sockets.length === 0)
				roomSockets[roomId] = undefined;
			
			console.log('[socket.io] ' + socket.handshake.address + ' disconnected.');
		});

	}); // end connection event

	// check room capacity: false if not full, true if full
	exports.roomFull = function(roomId) {
		var room = io.sockets.adapter.rooms[roomId];
		return room === undefined ? false : room.length > 1 ? true : false;
	};

}; // end run

// finds nth occurrence of pattern in string
function nthIndex(str, pat, n) {
	var L = str.length, i = -1;
	while (n-- && i++<L) {
		i= str.indexOf(pat, i);
		if (i < 0) break;
	}
	return i;
} // end nthIndex

module.exports = exports;