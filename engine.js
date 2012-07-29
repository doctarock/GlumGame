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
  messageStack: [ ],
  globalTicker: 0,
  colors: [ 'red', 'green', 'pink', 'yellow', 'cyan', 'white', 'orange' ],
  gameInput: function(index, strMessage){
	  //if not locked
	  
	  if (this.clients[index].avatar !== undefined && this.clients[index].avatar.mode !== 2){
	  			this.clients[index].avatar.mode = 1;
				switch (strMessage) {
					case "a_left": 
									if (this.clients[index].avatar.xdir === -1){
										this.clients[index].avatar.xdir = 0;
									} else {
										this.clients[index].avatar.xdir = -1;
									}
									break;
					case "a_right": 
									if (this.clients[index].avatar.xdir === 1){
										this.clients[index].avatar.xdir = 0;
									} else {
										this.clients[index].avatar.xdir = 1;
									}
									break;
					case "a_up": 
									if (this.clients[index].avatar.ydir === -1){
										this.clients[index].avatar.ydir = 0;
									} else {
										this.clients[index].avatar.ydir = -1;
									}
									break;
					case "a_down": 
									if (this.clients[index].avatar.ydir === 1){
										this.clients[index].avatar.ydir = 0;
									} else {
										this.clients[index].avatar.ydir = 1;
									}
									break;
					case "a_special": 
	  								this.clients[index].avatar.mode = 2;
									break;
				}
				this.clients[index].avatar.ticker = 200;
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
					for (var i=0; i < this.clients.length; i++) {
						if (type === "avatar" && id === i){
							//skip
						}else if (typeof this.clients[i].avatar !== "undefined"){
							OX = Math.floor(this.clients[i].avatar.xpos+(this.clients[i].avatar.size/2));
							OY = Math.floor(this.clients[i].avatar.ypos+(this.clients[i].avatar.size/2));
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
			
			}
			this.messageStack.push(JSON.stringify({ type:'sound', data: 2 }));
	  },
  playerDies: function(clientid){
				//glum dies
				this.missile.push(this.spawn.Devil(this.clients[clientid].avatar.xpos, this.clients[clientid].avatar.ypos));
				this.env.push(this.spawn.Mushroom(this.clients[clientid].avatar.xpos, 
												  this.clients[clientid].avatar.ypos, 
												  this.clients[clientid].score, 0));
				this.clients[clientid].score = 0;
				this.clients[clientid].gameStatus = 2;
				this.clients[clientid].sendUTF(JSON.stringify({ type:'game', data: 2 }));
				this.clients[clientid].avatar = undefined;
				this.messageStack.push(JSON.stringify({ type:'sound', data: 8 }));
	  },
  shroomDies: function(shroomid, clientid){
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
												this.clients[clientid].avatar.xpos, 
												this.clients[clientid].avatar.ypos);
												
				this.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
			}
			if (typeof this.clients[clientid].avatar !== "undefined"){
				this.clients[clientid].avatar.health += this.env[shroomid].health;
				if (this.env[shroomid].health > 0){
				var msgObj = this.spawn.Message(this.clients[clientid].userName, 
												"#8cff3f", 
												"+"+this.env[shroomid].health, 
												this.clients[clientid].avatar.xpos+20, 
												this.clients[clientid].avatar.ypos+20);
												
				this.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
				} else 
				if (this.env[shroomid].health < 0){
					var msgObj = this.spawn.Message(this.clients[clientid].userName, 
													"#ff3f3f", 
													this.env[shroomid].health, 
													this.clients[clientid].avatar.xpos+20, 
													this.clients[clientid].avatar.ypos+20);
													
					this.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
					
				}
				if (this.clients[clientid].avatar.health > 100){this.clients[clientid].avatar.health = 100;}
			}
			this.envTrash.push(shroomid);
	  },
  sendComms: function(){
				this.messageStack.push(JSON.stringify({ type:'entities', data: this.env.concat(this.npc,this.missile,this.avatar)}));
				//send to each client
				for (var j=0; j < this.clients.length; j++) {
					if (typeof this.clients[j].avatar !== "undefined"){
						this.clients[j].sendUTF(JSON.stringify({ type:'update', data: this.messageStack }));
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

				//if (action === true)
				//	console.log("Removed "+cntnpc+"("+this.npc.length+") "+cntenv+"("+this.env.length+") "+cntmis+"("+this.missile.length+") (npc)(env)(missile) | (clients)" + this.clients.length);
			},
	
  htmlEntities: function (str) {
				return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
								  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
			},
  goGlums: function(){
			//only do advanced functions for players
			this.avatar.splice (0,this.avatar.length);
			for (var i=0; i < this.clients.length; i++) {
				if (typeof this.clients[i].avatar !== "undefined"){
					this.ai.Glum(this.clients[i].avatar);
					
					// if clinet shoots
					if(this.clients[i].avatar.mode === 2 && this.clients[i].avatar.ticker === 50){
						this.missile.push(
								this.spawn.Special(i,
												   this.clients[i].avatar.xpos+(this.clients[i].avatar.size/2), 
												   this.clients[i].avatar.ypos+(this.clients[i].avatar.size/2), 
												   this.clients[i].avatar.xdir
								)
						);
					}
					 //if dead dont bother calculations, just kill it
					if (this.clients[i].avatar.health < 1) {
						this.playerDies(i);
					} else {
						//check collision with environment
						var collision = this.overlap(this.clients[i].avatar.xpos, this.clients[i].avatar.ypos, this.clients[i].avatar.size, 10, i, "avatar", "env");
						if (collision > -1){
							//shroom
							if (this.env[collision].mode === 10){
								this.shroomDies(collision, i);
							}
						}
						
						//check collision with missiles
						var collision = this.overlap(this.clients[i].avatar.xpos, this.clients[i].avatar.ypos, this.clients[i].avatar.size, 10, i, "avatar", "missile");
						if (collision > -1){
							//bomb
							if (this.missile[collision].mode === 30){
								this.clients[i].avatar.health -= 5;
								this.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));			
								this.messageStack.push(JSON.stringify({ type:'message', data:this.spawn.Message(this.clients[i].userName, 
																												"#ff3f3f", 
																												"-5", 
																												this.clients[i].avatar.xpos, 
																												this.clients[i].avatar.ypos) }));
							} else if (this.missile[collision].mode === 50){
							//sproing
								this.clients[i].score += 10;
								this.clients[i].sendUTF(JSON.stringify({ type:'score', data: this.clients[i].score }));
								var msgObj = this.spawn.Message(this.clients[i].userName, "#fff43f", "+10", this.clients[i].avatar.xpos, this.clients[i].avatar.ypos);
								this.messageStack.push(JSON.stringify({ type:'message', data:msgObj }));
								this.missile[collision].score = 1;
								this.missile[collision].client = i;
							}
						}
						this.avatar.push(this.clients[i].avatar);	 
					 }
		    	}//if typeOf
			}//for
	     },
	goMissiles: function(){
		for (var i=0; i < this.missile.length; i++) {
			if(this.missile[i].mode === 30){
				//bombs away
				this.ai.Bomb(this.missile[i]);
				
				if (this.missile[i].ypos > 500){
					this.missileTrash.push(i);
				} else {
					//check if shroom hit
					var collision = this.overlap(this.missile[i].xpos, this.missile[i].ypos, this.missile[i].size, 10, i, "missile", "env");
					if (collision > -1){
						this.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
						this.envTrash.push(collision);
					}
					//check if sproing hit
					var collision = this.overlap(this.missile[i].xpos, this.missile[i].ypos, this.missile[i].size, 10, i, "missile", "missile");
					if (collision > -1)
					{
						if (this.missile[i].mode === 50 && this.missile[i].score === 0){
							this.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
							this.missileTrash.push(collision);
						}
					}
				}
				
			} else if(this.missile[i].mode === 40){
				//devils away
				this.ai.Devil(this.missile[i]);
				
				if (this.missile[i].ypos < 0){
					this.missileTrash.push(i);
				} else {
					//check if bird hit
					var collision = this.overlap(this.missile[i].xpos, this.missile[i].ypos, this.missile[i].size, 10, i, "missile", "npc");
					if (collision > -1){
						this.messageStack.push(JSON.stringify({ type:'sound', data: 6 }));
						this.npcTrash.push(collision);
					}
				}
			} else if(this.missile[i].mode === 50){
				//sproing away
				this.ai.Sproing(this.missile[i]);
				
				if (this.missile[i].ypos < 0){
					this.missileTrash.push(i);
				} else {
					var collision = this.overlap(this.missile[i].xpos, this.missile[i].ypos, this.missile[i].size, 10, i, "missile", "npc");
					if (collision > -1 && this.missile[i].client > -1 && this.clients[this.missile[i].client] !== undefined){
						this.clients[this.missile[i].client].score += 1000;
						this.clients[this.missile[i].client].sendUTF(JSON.stringify({ type:'score', data: this.clients[this.missile[i].client].score }));
						this.npcTrash.push(collision);
						this.messageStack.push(JSON.stringify({ type:'message', data:this.spawn.Message(this.clients[this.missile[i].client].userName, 
																					 "#fff43f", 
																					 "+1000", 
																					 this.clients[this.missile[i].client].avatar.xpos, 
																					 this.clients[this.missile[i].client].avatar.ypos) }));
					}
				}
			} else if(this.missile[i].mode === 69){
				//special move
				
				this.ai.Special(this.missile[i]);
				if (this.missile[i].xpos < 0 || this.missile[i].xpos > 500){
					this.missileTrash.push(i);
				} else {
					var collision = this.overlap(this.missile[i].xpos, this.missile[i].ypos, this.missile[i].size, 20, i, "missile", "avatar");
					if (collision > -1 && this.missile[i].client > -1 && this.missile[i].client !== collision){
						console.log("we hit someone");
						this.clients[this.missile[i].client].score += 100;
						this.clients[collision].avatar.health -= 10;
						this.clients[this.missile[i].client].sendUTF(JSON.stringify({ type:'score', data: this.clients[this.missile[i].client].score }));
						this.npcTrash.push(collision);
						this.messageStack.push(JSON.stringify({ type:'message', data:this.spawn.Message(this.clients[this.missile[i].client].userName, 
																										"#fff43f", 
																										"+100", 
																										this.clients[this.missile[i].client].avatar.xpos, 
																										this.clients[this.missile[i].client].avatar.ypos) }));
						this.messageStack.push(JSON.stringify({ type:'message', data:this.spawn.Message(this.clients[collision].userName, 
																										"#ff3f3f", 
																										"-10", 
																										this.clients[collision].avatar.xpos, 
																										this.clients[collision].avatar.ypos) }));
					}
				}
			}
		}
	},
	goNpcs: function (){
		for (var i=0; i < this.npc.length; i++) {
			 if(this.npc[i].mode === 20){
				//bird is the word
				this.ai.Bird(this.npc[i]);
				
				var chance = Math.floor((Math.random()*100))
				if (chance === 1 && this.missile.length < (this.clients.length+this.npc.length)*5){
					this.missile.push(this.spawn.Bomb(this.npc[i].xpos+(this.npc[i].size/2), this.npc[i].ypos+(this.npc[i].size/2)));
					this.messageStack.push(JSON.stringify({ type:'sound', data: 5 }));		
				}
			}
		}	
	},
	goEnvironment: function (){
		var chance = Math.floor((Math.random()*(1000/this.clients.length)))

		//up to 2 birds per player with a maximum of 5 birds
		if (chance === 1 && this.npc.length < 3 && this.npc.length < this.clients.length*2){
			//spawn a new bird
			this.npc.push(this.spawn.Bird());
			this.messageStack.push(JSON.stringify({ type:'sound', data: 5 }));
		}

		// spawn shrooms/sproings more rapidly the more birds and clients connected, cap at 4 per bird/client
		if (this.globalTicker > (500/(this.clients.length+this.npc.length)) && (this.env.length) < ((this.clients.length+this.npc.length)*4)){
			this.rollSpawns();
			this.globalTicker = 0;
		} else {
			this.globalTicker += 1;
		}
	}
};