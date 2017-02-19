//Vars

var moveSpeed = 0.2;
var yspeed = 0;
var isjump = false;
var solids = [];

//Start
ge.start(() => {
  solids = ["dirt", "grass"];
});

//Update
ge.loop(() => {
  player.y -= yspeed;
  yspeed-=0.01;
  if(playerStandingOnSolid()) {
    yspeed = 0;
    if(isjump) {
      yspeed = 0.3;
    }
  }
  if(playerOutOfWorld()) {
    location.reload();
  }
});

//Keypress
ge.keys(() => {
  if (keys.has("W")) {
    isjump = true;
  } else {
      isjump = false;
  }
  if (keys.has("A")) {
    if(!playerGoingToHitSolid(-1, 0)) {
      player.x-=moveSpeed;
    }
  }
  if (keys.has("S")) {
    // player.y+=moveSpeed;
  }
  if (keys.has("D")) {
    if(!playerGoingToHitSolid(1, 0)) {
      player.x+=moveSpeed;
    }
  }
});

function playerOutOfWorld() {
  let thing = false;
  let size = {width: mapObj.width, height: mapObj.height};

  if(player.x > size.width || player.x < 0) {
    thing = true;
  }
  if(player.y > size.height || player.y < 0) {
    thing = true;
  }

  return thing;
}

function playerGoingToHitSolid(x, y) {
  let tile;
  if(x > 0) {
    tile = tilemap.getTileByPos(player.x+x, player.y+y);
  } else if (x < 0) {
    tile = tilemap.getTileByPos(player.x+x+1, player.y+y);
  }

  let type = tile.type;
  for(let i = 0; i < solids.length; i++) {
    if(type == solids[i]) {
      return true;
    }
  }
  return false;
}

function playerStandingOnSolid() {
  let ground = tilemap.getTileByPos(player.x, player.y+1).type;

  for(let i = 0; i < solids.length; i++) {
    if(ground == solids[i]) {
      return true;
    }
  }
  return false;
}