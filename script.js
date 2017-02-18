var canvas, ctx;
setupCanvas();

var tilemap = new TileMap();
var maxId = 0;
var keysDown = {};
var images = [];
var map = "basic_map";
var player = tilemap.addTile(new Tile(getImage("player"), 0, 0));
var moveSpeed = 0.2;
/*
  Tilemap is 76 (width) by 29 (height)

  var tile = new Tile("grass", 0, 0);
*/

// var tile1 = new Tile("grass", 0, 0);
// var tile2 = new Tile("grass", 0, 1);

function TileMap() {
  this.tiles = [];

  this.addTile = function (tile) {
    this.tiles.push(tile);
    return tile;
  }

  this.render = function () {
    for (let i = 0; i < this.tiles.length; i++) {
      let tile = this.tiles[i];
      this.renderTile(tile);
    }
  }

  this.changeTile = function (id, newtile) {
    let tile = this.getTileById(id);
    tile = newtile;
    tile.id = id;
    return tile;
  }

  this.renderTile = function (tile) {
    let newTile = tile;
    if (this.getTileById(tile.id) != null) {
      newTile = this.getTileById(tile.id);
    }

    if(newTile.img == null) throw newTile
    ctx.drawImage(newTile.img, newTile.x*25, newTile.y*25, 25, 25);
    return tile;
  }

  this.getTileById = function (id) {
    for (let i = 0; i < this.tiles.length; i++) {
      let tile = this.tiles[i];
      if (tile.id == id) {
        return tile;
      }
    }
    return null;
  }

  this.getTileByPos = function (rawX, rawY) {
    let x = Math.floor(rawX);
    let y = Math.floor(rawY)
;    for (let i = 0; i < this.tiles.length; i++) {
      let tile = this.tiles[i];
      if(tile.x == x && tile.y == y) {
        return tile;
      }
    }
    throw "Could not find tile at pos x: "+x+", y: "+y;
  }
}

function Tile(img, x, y) {
  maxId+=1;
  this.id = maxId;
  this.x = x;
  this.y = y;
  this.img = img;
  this.type = img.src
}

function getImage(name) {
  let img = new Image();
  img.src = "images/"+name+".png";
  return img;
}

document.addEventListener("keydown", function(e) {
  let keycode = e.which || e.keyCode;
  let key = String.fromCharCode(keycode);
  keysDown[key] = true;
});
document.addEventListener("keyup", function(e) {
  let keycode = e.which || e.keyCode;
  let key = String.fromCharCode(keycode);
  keysDown[key] = false;
});

function getKeysPressed() {
  let keys = [];
  let objkeys = Object.keys(keysDown);
  for (let i = 0; i < objkeys.length; i++) if(Object.values(keysDown)[i]) keys.push(objkeys[i])
  keys.has = function (key) {
    return keys.includes(key);
  }
  if (keys.has("W")) {
    player.y-=moveSpeed;
    console.log(tilemap.getTileByPos(player.x, player.y+1));
  }
  if (keys.has("A")) {
    player.x-=moveSpeed;
  }
  if (keys.has("S")) {
    player.y+=moveSpeed;
  }
  if (keys.has("D")) {
    player.x+=moveSpeed;
  }
}

function drawPlayer(x, y) {
  player.x = x;
  player.y = y;
  player = tilemap.renderTile(player);
}

// function loadTileMap() {
//   let tilesOnMap = [];
//   loadJSON("test", function (json) {
//     tilesOnMap = JSON.parse(json);
    
//     for (let i = 0; i < tilesOnMap.length; i++) {
//       let tile = tilesOnMap[i];
//       tilemap.addTile(new Tile(images[tile.img], tile.x, tile.y));
//     }
//     console.log(tilemap.tiles)
//   });

  // for(let i = 0; i < 76; i++) {
  //   for(let j = 0; j < 29; j++) {
  //       tilemap.addTile(new Tile(images.dirt, i, j));
  //   }
  // }
//}

function loadTiledMap() {
  let tiled = [];
  loadJSON(map, function (json) {
    tiled = JSON.parse(json);
    let layer = tiled.layers[0].data;
    let tiledtypes = tiled.tilesets[0].tiles;
    let tiletypes = [];
    for (let i = 0; i < Object.keys(tiledtypes).length; i++) {
      let type = tiledtypes[i];
      let imgpath = type.image;
      let img1 = imgpath.substr(10);
      let img = img1.substr(0, img1.length-4);
      tiletypes.push(img)
      images.push(getImage(img));
    }

    let currpos = {x: 0, y: 0};
    let maxpos = {x: tiled.width, y: tiled.height}
    for (let y = 0; y < maxpos.y; y++) {
      for (let x = 0; x < maxpos.x; x++) {
        let length = currpos.y*maxpos.y + currpos.x
        let tile = layer[length];
        if(tile == 0) continue;
        let tiletype = images[tile-1];
        if(tiletype == null) throw tile;
        tilemap.addTile(new Tile(tiletype, currpos.x, currpos.y));
        currpos.x++;
      }
      currpos.y++;
      currpos.x = 0;
    }
  });
}
loadTiledMap();

function drawCanvas() {
  getKeysPressed();
  tilemap.render();
  drawPlayer(player.x, player.y);
  window.requestAnimationFrame(drawCanvas);
}

function setupCanvas() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.tabIndex = 1000;
  ctx.imageSmoothingEnabled = false;
}
drawCanvas();

function loadJSON(path, callback) {   
  var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
  xobj.open('GET', 'tilemaps/'+path+'.json', true);
  xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          callback(xobj.responseText);
        }
  };
  xobj.send(null);  
}