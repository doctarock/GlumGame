// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'glum-game';

// Main game object
var game = require('./engine');

/**
* HTTP server
*/
var server = game.http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});

server.listen(game.webSocketServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + game.webSocketServerPort);
});

/**
* WebSocket server
*/
var wsServer = new game.webSocketServer({
    // WebSocket server is tied to a HTTP server. To be honest I don't understand why.
    httpServer: server
});

// communication --------------------------------------------------------------------------------------------------------

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
	
    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
	if (request.origin == "http://deekiki.com" || request.origin == "http://www.deekiki.com"){
		var connection = request.accept(null, request.origin);
		// we need to know client index to remove them on 'close' event
		var index = game.clients.push(connection) - 1;
		var entityindex;
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
					// remember user name
					userName = strMessage;
					userColor = game.colors.shift();
					
					connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
					console.log('#### User is known as: ' + userName + ' with ' + userColor + ' color.');
	
					//add glum and move it to position
					var entityobj = game.spawn.Glum(userName, userColor, index);
					//game.ai.Glum(entityobj);
					game.messageStack.push(JSON.stringify({ type:'sound', data: 9 }));
					
					this.entityindex = game.avatar.push(entityobj) - 1;
					this.score = 0;
					
				} else if (strMessage === "restart" && userName !== false) {
	
					//add glum and move it to position
					var entityobj = game.spawn.Glum(userName, userColor, index);
					game.ai.Glum(entityobj);
					this.entityindex = game.avatar.push(entityobj) - 1;
					this.score = 0;
					
					connection.sendUTF(JSON.stringify({ type:'game', data: 1 }));
					game.messageStack.push(JSON.stringify({ type:'sound', data: 9 }));
					
	
				} else if (strMessage.indexOf("a_") === 0 && userName !== false) {
					game.gameInput(this.entityindex, strMessage);
				} else { // log and broadcast the message
					if (game.avatar[this.entityindex] === undefined){
						var msgObj = game.spawn.Message(userName, userColor, strMessage);
					}else{
						var msgObj = game.spawn.Message(userName, userColor, strMessage, game.avatar[this.entityindex].xpos, game.avatar[this.entityindex].ypos);
					}
					game.history.push(msgObj);
					console.log('### '+game.history[game.history.length-1].text+' ' + game.history[game.history.length-1].xpos, + ' ' + game.history[game.history.length-1].ypos);
					game.history = game.history.slice(-22);
					
					// broadcast message to all connected clients
					game.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
				}
			}
		});

		// user disconnected
		connection.on('close', function(connection) {
			if (userName !== false && userColor !== false) {
				console.log((new Date()) + " Peer "	+ this.remoteAddress + " disconnected. "+index);

				// remove user from the list of connected clients
				game.avatar.splice(index, 1);

				// remove user from the list of connected clients
				game.clients.splice(index, 1);
				// push back user's color to be reused by another user
				game.colors.push(userColor);
			}
		});
	}
	

});

//this is the "loop" for doing dynamic stuff ---------------------------------------------------------------------------------------

setInterval(function() {
	game.goGlums();
	
	//missile actions
	for (var i=0; i < game.missile.length; i++) {
		if(game.missile[i].mode === 30){
			//bombs away
			game.ai.Bomb(game.missile[i]);
			
			if (game.missile[i].ypos > 500){
				game.missileTrash.push(i);
			} else {
				//check if shroom hit
				var collision = game.overlap(game.missile[i].xpos, game.missile[i].ypos, game.missile[i].size, 10, i, "missile", "env");
				if (collision > -1){
					game.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
					game.envTrash.push(collision);
				}
				//check if sproing hit
				var collision = game.overlap(game.missile[i].xpos, game.missile[i].ypos, game.missile[i].size, 10, i, "missile", "missile");
				if (collision > -1)
				{
					if (game.missile[i].mode === 50 && game.missile[i].score === 0){
						game.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
						game.missileTrash.push(collision);
					}
				}
			}
			
		} else if(game.missile[i].mode === 40){
			//devils away
			game.ai.Devil(game.missile[i]);
			
			if (game.missile[i].ypos < 0){
				game.missileTrash.push(i);
			} else {
				//check if bird hit
				var collision = game.overlap(game.missile[i].xpos, game.missile[i].ypos, game.missile[i].size, 10, i, "missile", "npc");
				if (collision > -1){
					game.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
					game.npcTrash.push(collision);
				}
			}
		} else if(game.missile[i].mode === 50){
			//sproing away
			game.ai.Sproing(game.missile[i]);
			
			if (game.missile[i].ypos < 0){
				game.missileTrash.push(i);
			} else {
				var collision = game.overlap(game.missile[i].xpos, game.missile[i].ypos, game.missile[i].size, 10, i, "missile", "npc");
				if (collision > -1 && game.missile[i].client > -1 && game.clients[game.missile[i].client] !== undefined){
					game.clients[game.missile[i].client].score += 1000;
					game.clients[game.missile[i].client].sendUTF(JSON.stringify({ type:'score', data: game.clients[game.missile[i].client].score }));
					game.npcTrash.push(collision);
					game.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
					var msgObj = game.spawn.Message(game.clients[game.missile[i].client].userName, "#fff43f", "+1000", game.avatar[game.clients[game.missile[i].client].entityindex].xpos, game.avatar[game.clients[game.missile[i].client].entityindex].ypos);
					game.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
				}
			}
		} else if(game.missile[i].mode === 69){
			//special move
			
			game.ai.Special(game.missile[i]);
			if (game.missile[i].xpos < 0 || game.missile[i].xpos > 500){
				game.missileTrash.push(i);
			} else {
				var collision = game.overlap(game.missile[i].xpos, game.missile[i].ypos, game.missile[i].size, 10, i, "missile", "npc");
				if (collision > -1 && game.missile[i].client > -1){
					game.clients[game.missile[i].client].score += 1000;
					game.clients[game.missile[i].client].sendUTF(JSON.stringify({ type:'score', data: game.clients[game.missile[i].client].score }));
					game.npcTrash.push(collision);
					game.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
					var msgObj = game.spawn.Message(userName, "#fff43f", "+1000", game.avatar[game.clients[game.missile[i].client].entityindex].xpos, game.avatar[game.clients[game.missile[i].client].entityindex].ypos);
					game.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
				}
			}
		}
	}
	
	//npc actions
	for (var i=0; i < game.npc.length; i++) {
		 if(game.npc[i].mode === 20){
			//bird is the word
			game.ai.Bird(game.npc[i]);
			
			var chance = Math.floor((Math.random()*100))
			if (chance === 1 && game.missile.length < (game.clients.length+game.npc.length)*5){
				game.missile.push(game.spawn.Bomb(game.npc[i].xpos+(game.npc[i].size/2), game.npc[i].ypos+(game.npc[i].size/2)));
				game.messageStack.push(JSON.stringify({ type:'sound', data: 5 }));		
			}
		}
	}
	
	//Environmental Actions
	var chance = Math.floor((Math.random()*(800/game.clients.length)))
	if (chance === 1 && game.npc.length < game.clients.length*2){
		//spawn a new bird
		game.npc.push(game.spawn.Bird());
		game.messageStack.push(JSON.stringify({ type:'sound', data: 5 }));
		console.log((new Date()) + " New bird "+game.npc.length);
	}
	
	if (game.globalTicker > (100/(game.clients.length+game.npc.length)) && (game.env.length+game.missile.length) < ((game.clients.length+game.npc.length)*5)){
		console.log((new Date()) + " Roll spawns ");
		game.rollSpawns();
		game.globalTicker = 0;
	} else {
		game.globalTicker += 1;
	}
	
	//game.messageStack.push(JSON.stringify({ type:'killentity', data: game.envTrash.concat(game.npcTrash,game.missileTrash,game.avatarTrash)}));
	game.messageStack.push(JSON.stringify({ type:'entities', data: game.env.concat(game.npc,game.missile,game.avatar)}));
	game.sendComms();
	game.clearTrash();

}, 100);