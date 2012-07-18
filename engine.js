// Engine ------------------------------------------------------------------------------------------------ Engine //
module.exports = {
  webSocketServer: require('websocket').server,
  webSocketServerPort:  1337,
  http: require('http'),
  spawn: require('./spawners'),
  ai: require('./ai'),
  history: [ ],
  clients: [ ],
  npc: [ ],
  env: [ ],
  missile: [ ],
  avatar: [ ],
  npcTrash: [ ],
  envTrash: [ ],
  missileTrash: [ ],
  avatarTrash: [ ],
  messageStack: [ ],
  globalTicker: 0,
  colors: [ 'red', 'green', 'pink', 'yellow', 'cyan', 'white', 'orange' ],
  gameInput: function(index, strMessage){
	  //if not locked
	  if (this.avatar[index].mode !== 2){
	  			this.avatar[index].mode = 1;
				switch (strMessage) {
					case "a_left": 
									if (this.avatar[index].xdir === -1){
										this.avatar[index].xdir = 0;
									} else {
										this.avatar[index].xdir = -1;
									}
									break;
					case "a_right": 
									if (this.avatar[index].xdir === 1){
										this.avatar[index].xdir = 0;
									} else {
										this.avatar[index].xdir = 1;
									}
									break;
					case "a_up": 
									if (this.avatar[index].ydir === -1){
										this.avatar[index].ydir = 0;
									} else {
										this.avatar[index].ydir = -1;
									}
									break;
					case "a_down": 
									if (this.avatar[index].ydir === 1){
										this.avatar[index].ydir = 0;
									} else {
										this.avatar[index].ydir = 1;
									}
									break;
					case "a_special": 
	  								this.avatar[index].mode = 2;
									break;
				}
				this.avatar[index].ticker = 200;
	  		}
	  },
  overlap: function (xpos, ypos, size, scale, id, type, target) {

				var DX = xpos+(size/2);
				var DY = ypos+(size/2);
				var OX;
				var OY;
				switch (target) {
					case "npc": 
						for (var i=0; i < this.npc.length; i++) {
							if (type === "npc" && id === i){}else{
								OX = Math.floor(this.npc[i].xpos+(this.npc[i].size/2));
								OY = Math.floor(this.npc[i].ypos+(this.npc[i].size/2));
								if (DX >= OX - scale && DX <= OX + scale && DY >= OY - scale && DY <= OY + scale) {
									return i;
								}
							}
						}
					break;
					case "env": 
					for (var i=0; i < this.env.length; i++) {
							if (type === "env" && id === i){}else{
								OX = Math.floor(this.env[i].xpos+(this.env[i].size/2));
								OY = Math.floor(this.env[i].ypos+(this.env[i].size/2));
								if (DX >= OX - scale && DX <= OX + scale && DY >= OY - scale && DY <= OY + scale) {
									return i;
								}
							}
					}
					break;
					case "missile": 
					for (var i=0; i < this.missile.length; i++) {
						if (type === "missile" && id === i){}else{
							OX = Math.floor(this.missile[i].xpos+(this.missile[i].size/2));
							OY = Math.floor(this.missile[i].ypos+(this.missile[i].size/2));
							if (DX >= OX - scale && DX <= OX + scale && DY >= OY - scale && DY <= OY + scale) {
								return i;
							}
						}
					}
					
					break;
					case "avatar": 
					for (var i=0; i < this.avatar.length; i++) {
						if (type === "avatar" && id === i){
							//skip
						}else{
							OX = Math.floor(this.avatar[i].xpos+(this.avatar[i].size/2));
							OY = Math.floor(this.avatar[i].ypos+(this.avatar[i].size/2));
							if (DX >= OX - scale && DX <= OX + scale && DY >= OY - scale && DY <= OY + scale) {
								return i;
							}
						}
					}
					break;
				}
				return -1;
	
  			},
  rollSpawns: function (){
	 		var chance = Math.floor(Math.random()*11)
			var rndScore = Math.floor(Math.random()*11)
			var rndHealth = Math.floor(Math.random()*11)
			if (chance < 2){
					this.missile.push(this.spawn.Sproing());
					this.messageStack.push(JSON.stringify({ type:'sound', data: 2 }));
			} else {
				if (chance < 6){
					rndScore = rndScore*10
					rndHealth = rndHealth*20
				} else if (chance === 7){
					rndScore = rndScore*50
					rndHealth = 0
				} else if (chance < 10){
					rndScore = rndScore*30
					rndHealth = -rndHealth*7
				} else if (chance < 15){
					rndScore = 0		
					rndHealth = 0
				} else {
					rndScore = rndScore*6+chance
					rndHealth = rndHealth*6+chance
				}

				this.env.push(this.spawn.Mushroom(0, 0, rndScore, rndHealth));
				this.messageStack.push(JSON.stringify({ type:'sound', data: 2 }));
			
			}
	  },
  playerDies: function(avatarid, clientid){
	  
				this.missile.push(this.spawn.Devil(this.avatar[avatarid].xpos, this.avatar[avatarid].ypos));
				
				//glum dies
				this.avatar[avatarid].health = 0;
				this.avatarTrash.push(avatarid);
				
				if (typeof this.clients[clientid] !== "undefined"){
					this.env.push(this.spawn.Mushroom(this.avatar[avatarid].xpos, this.avatar[avatarid].ypos, this.clients[clientid].score, 0));
					this.clients[clientid].score = 0;
					this.clients[clientid].sendUTF(JSON.stringify({ type:'score', data: 0 }));
					this.clients[clientid].sendUTF(JSON.stringify({ type:'game', data: 2 }));
				}
				this.messageStack.push(JSON.stringify({ type:'sound', data: 8 }));
	  },
  shroomDies: function(shroomid, avatarid, clientid){
			if (this.env[shroomid].score > 100 || this.env[shroomid].health > 100) {
				this.messageStack.push(JSON.stringify({ type:'sound', data: 7 }));
			} else if (this.env[shroomid].score < 0 || this.env[shroomid].health < 0) {
				this.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
			} else if (this.env[shroomid].score === 0 && this.env[shroomid].health === 0) {
				this.messageStack.push(JSON.stringify({ type:'sound', data: 2 }));
			} else {
				this.messageStack.push(JSON.stringify({ type:'sound', data: 1 }));
			}
			if (this.env[shroomid].score > 0 && typeof this.clients[clientid] !== undefined){
				this.clients[clientid].score += this.env[shroomid].score;				
				this.clients[clientid].sendUTF(JSON.stringify({ type:'score', data: this.clients[clientid].score }));
				
				var msgObj = this.spawn.Message(this.clients[clientid].userName, 
												"#fff43f", 
												"+"+this.env[shroomid].score, 
												this.avatar[this.clients[clientid].entityindex].xpos, 
												this.avatar[this.clients[clientid].entityindex].ypos);
												
				this.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
			}
			if (typeof this.avatar[avatarid] !== "undefined"){
				this.avatar[avatarid].health += this.env[shroomid].health;
				if (this.env[shroomid].health > 0){
				var msgObj = this.spawn.Message(this.clients[clientid].userName, 
												"#8cff3f", 
												"+"+this.env[shroomid].health, 
												this.avatar[this.clients[clientid].entityindex].xpos+20, 
												this.avatar[this.clients[clientid].entityindex].ypos+20);
												
				this.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
				} else 
				if (this.env[shroomid].health < 0){
					var msgObj = this.spawn.Message(this.clients[clientid].userName, 
													"#ff3f3f", 
													this.env[shroomid].health, 
													this.avatar[this.clients[clientid].entityindex].xpos+20, 
													this.avatar[this.clients[clientid].entityindex].ypos+20);
													
					this.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
					
				}
				if (this.avatar[avatarid].health > 100){this.avatar[avatarid].health = 100;}
			}
			this.envTrash.push(shroomid);
	  },
  sendComms: function(){
				//loop through comms
				for (var i=0; i < this.messageStack.length; i++) {
					//send to each client
					for (var j=0; j < this.clients.length; j++) {
						this.clients[j].sendUTF(this.messageStack[i]);
					}
				}
				this.messageStack.splice (0,this.messageStack.length);
			},
  clearTrash: function(){
	  			var action = false;
	  			var cntnpc = 0;
	  			var cntenv = 0;
	  			var cntmis = 0;
	  			var cntpla = 0;
				//remove dead NPC elements
				for (var i=0; i < this.npcTrash.length; i++) {
					this.npc.splice(this.npcTrash[i], 1);
					action = true;
					cntnpc += 1;
				}
				this.npcTrash.splice (0,this.npcTrash.length);
				
				//remove dead Environment elements
				for (var j=0; j < this.envTrash.length; j++) {
					this.env.splice(this.envTrash[j], 1);
					action = true;
					cntenv += 1;
				}
				this.envTrash.splice (0,this.envTrash.length);
				
				//remove dead Missile elements
				for (var m=0; m < this.missileTrash.length; m++) {
					this.missile.splice(this.missileTrash[m], 1);
					action = true;
					cntmis += 1;
				}
				this.missileTrash.splice (0,this.missileTrash.length);
	
				//remove dead player elements
				for (var k=0; k < this.avatarTrash.length; k++) {
			
					this.avatar.splice(this.avatarTrash[k], 1);
					
					//fix up indexes to sync with this.clients
					for (var l=0; l < this.clients.length; l++) {
						if (this.clients[l].entityindex > this.avatarTrash[k]){
							this.clients[l].entityindex -=1;
							console.log("### New entity index "+this.clients[l].entityindex);
						}
					}
					action = true;	
					cntpla += 1;				
				}
				this.avatarTrash.splice (0,this.avatarTrash.length);
				if (action === true)
					console.log("Removed "+cntnpc+"("+this.npc.length+") "+cntenv+"("+this.env.length+") "+cntmis+"("+this.missile.length+") "+cntpla+"("+this.avatar.length+") (npc)(env)(missile)(avatar) | (clients)" + this.clients.length);
			},
	
  htmlEntities: function (str) {
				return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
								  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
			},
  goGlums: function(){
		  	var currClient
			//only do advanced functions for players
			for (var i=0; i < this.avatar.length; i++) {
				if (this.avatar[i].client > -1){
					currClient = this.avatar[i].client;
				} else {
					currClient = -1;	
				}
				// if this avatar has not become an orphan
				if (currClient > -1){
					this.ai.Glum(this.avatar[i]);
					if(this.avatar[i].mode === 2 && this.avatar[i].ticker === 40){
						this.missile.push(
								this.spawn.Special(this.avatar[i].client,
													this.avatar[i].xpos+(this.avatar[i].size/2), 
													this.avatar[i].ypos+(this.avatar[i].size/2), 
													this.avatar[i].xdir
								)
						);
					}
					 //if dead dont bother calculations, just kill it
					 if (this.avatar[i].health < 1) {
						this.playerDies(i, currClient);
					} else {
						//check collision with environment
						var collision = this.overlap(this.avatar[i].xpos, this.avatar[i].ypos, this.avatar[i].size, 10, i, "avatar", "env");
						if (collision > -1){
							//shroom
							if (this.env[collision].mode === 10){
								this.shroomDies(collision, i, currClient);
							}
						}
						
						//check collision with missiles
						var collision = this.overlap(this.avatar[i].xpos, this.avatar[i].ypos, this.avatar[i].size, 10, i, "avatar", "missile");
						if (collision > -1){
							//bomb
							if (this.missile[collision].mode === 30){
								this.avatar[i].health -= 5;
								this.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
								
								
								var msgObj = this.spawn.Message(this.clients[currClient].userName, 
																"#ff3f3f", 
																"-5", 
																this.avatar[this.clients[currClient].entityindex].xpos, 
																this.avatar[this.clients[currClient].entityindex].ypos);
																
								this.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
		
							} else if (this.missile[collision].mode === 50){
							//sproing
								if (typeof this.clients[currClient] !== "undefined"){
									this.clients[currClient].score += 10;
									this.clients[currClient].sendUTF(JSON.stringify({ type:'score', data: this.clients[currClient].score }));
									var msgObj = this.spawn.Message(this.clients[currClient].userName, "#fff43f", "+10", this.avatar[this.clients[currClient].entityindex].xpos, this.avatar[this.clients[currClient].entityindex].ypos);
									this.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
								}
								this.missile[collision].score = 1;
								this.missile[collision].client = currClient;
							}
						}
		
					}
					
				}
			}
	  }
};