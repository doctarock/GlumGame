// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";
// Main game object
var game = require('./engine');
// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'glum-game';
// dont crash on error
//process.on('uncaughtException', function (err) {console.error(err);});

/*** HTTP server ***/
var server = game.http.createServer(function(request, response) {});// Not important for us. We're writing WebSocket server, not HTTP server
server.listen(game.webSocketServerPort, function() {console.log((new Date()) + " Server is listening on port " + game.webSocketServerPort);});
/*** WebSocket server ***/
var wsServer = new game.webSocketServer({httpServer: server});// WebSocket server is tied to a HTTP server. To be honest I don't understand why.

// communication --------------------------------------------------------------------------------------------------------

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

	if (request.origin == "http://deekiki.com" || request.origin == "http://www.deekiki.com"){
		var connection = request.accept(null, request.origin);
		// we need to know client index to remove them on 'close' event
		var index = game.clients.push(connection) - 1;
		var userName = false;
		var userColor = false;
	
		console.log((new Date()) + ' Connection accepted.');
		// send back chat history
		if (game.history.length > 0) {
			connection.sendUTF(JSON.stringify( { type: 'history', data: game.history} ));
		}
	
		// user sent some message
		connection.on('message', function(message) {
			if (message.type === 'utf8') { // accept only text
				var strMessage = game.htmlEntities(message.utf8Data)
				if (userName === false) { // first message sent by user is their name

					userName = strMessage;
					userColor = game.colors.shift();
					connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
					console.log('#### User is known as: ' + userName + ' with ' + userColor + ' color.');
					game.messageStack.push(JSON.stringify({ type:'sound', data: 9 }));
					this.avatar = game.spawn.Glum(userName, userColor);
					this.score = 0;
					this.gameStatus = 1;
					
				} else if (strMessage === "restart" && userName !== false) {
	
					//add glum and move it to position
					this.avatar = game.spawn.Glum(userName, userColor);
					this.score = 0;
					this.gameStatus = 1;
					connection.sendUTF(JSON.stringify({ type:'game', data: 1 }));
	
				} else if (strMessage.indexOf("a_") === 0 && userName !== false) {

					game.gameInput(index, strMessage);

				} else { // log and broadcast the message

					var msgObj = game.spawn.Message(userName, userColor, strMessage);
					if (this.avatar !== undefined){
						var msgObj1 = game.spawn.Message(userName, userColor, strMessage, this.avatar.xpos, this.avatar.ypos);
						// broadcast message to all connected clients
						game.messageStack.push(JSON.stringify({ type:'message', data:msgObj1 }));
					}
					game.history.push(msgObj);
					game.history = game.history.slice(-22);

				}
			}
		});

		// user disconnected
		connection.on('close', function(connection) {
			if (userName !== false && userColor !== false) {
				console.log((new Date()) + " Peer "	+ this.remoteAddress + " disconnected. "+index);
				game.clients.splice(index, 1);
				game.colors.push(userColor);
			}
		});
	}
});

//this is the "loop" for doing dynamic stuff ---------------------------------------------------------------------------------------
setInterval(function() {
	game.goGlums();
	game.goMissiles();
	game.goNpcs();
	game.goEnvironment();
	game.sendComms();
	game.clearTrash();
}, 100);