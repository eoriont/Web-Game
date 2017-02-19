var canvas, ctx;
var maxId = 0;
var keysDown = {};
var images = [];
var map = "basic_map";
var state = {start: false, loop: false};
var ge = new GameEngine();
var tilemap = ge.tilemap;
var player = tilemap.addTile(new Tile(getImage("player"), 0, 0));
var keys = [];
var mapObj;

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
  let str1 = img.src;
  let str2 = str1.substr(str1.indexOf("/images/")+8, str1.length);
  let str3 = str2.substr(0, str2.length-4)
  this.type = str3;
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
  let objkeys = Object.keys(keysDown);
  keys = [];
  keys.has = function (key) {
    return keys.includes(key);
  }

  for (let i = 0; i < objkeys.length; i++) 
    if(Object.values(keysDown)[i]) 
      keys.push(objkeys[i])
  
}

function drawPlayer(x, y) {
  player.x = x;
  player.y = y;
  player = tilemap.renderTile(player);
}

function loadTileMap() {
  let tilesOnMap = [];
  loadJSON(map, function (json) {
    tilesOnMap = JSON.parse(json);
    
    for (let i = 0; i < tilesOnMap.length; i++) {
      let tile = tilesOnMap[i];
      tilemap.addTile(new Tile(images[tile.img], tile.x, tile.y));
    }
  });

  for(let i = 0; i < 76; i++) {
    for(let j = 0; j < 29; j++) {
        tilemap.addTile(new Tile(images.dirt, i, j));
    }
  }
}

function loadTiledMap() {
  let tiled = [];
  loadJSON(map, function (json) {
    tiled = JSON.parse(json);
    mapObj = tiled;
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

function setupCanvas() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.tabIndex = 1000;
  ctx.imageSmoothingEnabled = false;
}

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

function GameEngine() {
  this.tilemap = new TileMap();

  this.start = function(callback) {
    if(!state.start) {
        setTimeout(() => {this.start(callback)}, 50);
        return;
    }
    callback();
  }

  this.loop = function(callback) {
    if(!state.loop) {
        setTimeout(() => {this.loop(callback)}, 50);
        return;
    }
    window.requestAnimationFrame(callback);
    window.requestAnimationFrame(() => {this.loop(callback)});
  }

  this.keys = function(callback) {
    window.requestAnimationFrame(()=>{callback(keys)});
    window.requestAnimationFrame(()=>{this.keys(callback)});
  }
  
}

state.start = true;
state.loop = true;

ge.start(function() {
  setupCanvas();
  loadTiledMap();
});

ge.loop(() => {
  getKeysPressed();
  tilemap.render();
  drawPlayer(player.x, player.y);
});