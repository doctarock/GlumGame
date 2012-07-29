// SPAWNERS ------------------------------------------------------------------------------------------------ SPAWNERS //
module.exports = {
  Glum: function (userName, userColor) {

					 var entityobj = {
						xpos: Math.floor((Math.random()*480)+10),
						ypos: Math.floor((Math.random()*480)+10),
						name: userName,
						color: userColor,
						health: 100,
						xdir: 0,
						ydir: 0,
						mode: 0,
						size: 40,
						ticker: 0
					};
					
					return entityobj
	
  			},
  Mushroom: function (here, there, score, health) {
					
					if (here === 0 && there === 0){
						here = Math.floor((Math.random()*470));
						there = Math.floor((Math.random()*160)+300);
					}
					
					var mushroomobj = {
						mode: 10,
						xpos: here,
						ypos: there,
						size: 40,
						score: score,
						health: health
					};
					
					return mushroomobj;

			},
  Bird: function () {

					var birdobj = {
						mode: 20,
						xdir: 0,
						xpos: -40,
						ypos: Math.floor((Math.random()*160)),
						size: 40
					};
					
					return birdobj;

			},
  Bomb: function (here, there) {

				 var bombobj = {
					mode: 30,
					xdir: 0,
					xpos: here ,
					ypos: there+10,
					size: 10
				};
				
				return bombobj;

  			},
  Devil: function (here, there) {

				var devilobj = {
					mode: 40,
					xdir: 0,
					ydir: 0,
					xpos: here,
					ypos: there,
					size: 40
				};

				return devilobj;

  			},
  Sproing: function () {

				var sproingobj = {
					mode: 50,
					xdir: 0,
					ydir: 0,
					score: 0,
					client: -1,
					xpos: Math.floor((Math.random()*470)),
					ypos: Math.floor((Math.random()*160)+300),
					size: 40
				};
				
				return sproingobj;

			},
  Special: function (index, here, there, xdir) {

				var specialobj = {
					mode: 69,
					xdir: xdir,
					ydir: 0,
					score: 50,
					xpos: here,
					ypos: there,
					size: 40,
					client: index,
				};
				
				return specialobj;

			},
  Message: function (userName, userColor, message, here, there) {
				if (here === 0 && there === 0){
					here = Math.floor((Math.random()*470));
					there = Math.floor((Math.random()*160)+300);
				}
	  
                var obj = {
					mode: 60,
					xpos: here,
					ypos: there,
                    time: (new Date()).getTime(),
                    text: message,
                    author: userName,
                    color: userColor
                };
				return obj;
	}
};