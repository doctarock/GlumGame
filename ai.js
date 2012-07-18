// AI ------------------------------------------------------------------------------------------------ AI //
module.exports = {
	
  htmlEntities: function (str) {
				return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
								  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
			},
  Bird: function (objEntity) {
				if (objEntity.xdir === 0){
					objEntity.xpos -= 5;
				} else {
					objEntity.xpos += 5;
				}
				
				//set boundaries
				if (objEntity.xpos < -40){objEntity.xpos = -40;objEntity.xdir = 1;objEntity.ypos = Math.floor((Math.random()*160));}
				if (objEntity.xpos > 500){objEntity.xpos = 500;objEntity.xdir = 0;objEntity.ypos = Math.floor((Math.random()*160));}
  			},
  Bomb: function (objEntity) {
				objEntity.ypos += 10;
  			},
  Devil: function (objEntity) {
				objEntity.ypos -= 5;
  			},
  Text: function (objEntity) {
				objEntity.ypos -= 1;
  			},
  Sproing: function (objEntity) {
				if (objEntity.score > 0){
					objEntity.ypos -= 20;
				}
  			},
  Special: function (objEntity) {
				if (objEntity.xdir >= 0){
					objEntity.xpos += 15;
				} else {
					objEntity.xpos -= 15;
				}
  			},
  Glum: function (objEntity) {
				if(objEntity.ticker === 0 && objEntity.mode !== 2){
					objEntity.mode = 0;
					objEntity.text = "";
					//three states: negative, neutral, positive
					objEntity.xdir = Math.floor((Math.random()*5)-1);
					objEntity.ydir = Math.floor((Math.random()*50)-1);
					if (objEntity.ydir > 1)
						objEntity.ydir = 0;
			
					//ticks before re-roll
					objEntity.ticker = 50;
					
					if (objEntity.xdir > 1){
						objEntity.xdir = 0;
						objEntity.ticker = 20;
					}
				}
				if (objEntity.mode === 2){
					objEntity.ticker -= 20;
					if(objEntity.ticker === 0){
						objEntity.mode = 1;
						objEntity.ticker = 50;
					}
				} else {
					
					objEntity.xpos += objEntity.xdir*3;
					objEntity.ypos += objEntity.ydir*2;
					objEntity.ticker -= 1;
					
					//set boundaries
					if (objEntity.ypos < 300){objEntity.ypos = 300;objEntity.ydir = 1;}
					if (objEntity.xpos < 0){objEntity.xpos = 0;objEntity.xdir = 1;}
					if (objEntity.xpos > 460){objEntity.xpos = 460;;objEntity.xdir = -1;}
					if (objEntity.ypos > 460){objEntity.ypos = 460;objEntity.ydir = -1;}
				}
				
				if (objEntity.health > 0){
					objEntity.health -= .2;
				}
  			},
};