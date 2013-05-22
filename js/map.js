GameMap = pc.TileMap.extend("GameMap", {}, {

  critters:[],
  trees:[],
  items:[],

  init:function(tileSets) {
    this._super(tileSets, 75, 75);
  },

  generate:function() {
    this._super(1);
    var cx = Math.floor(this.tilesWide/2);
    var cy = Math.floor(this.tilesHigh/2);
    this.paint(cx-2,cy-2,5,5,4);
    this.critters.length = 0;
    this.trees.length = 0;
    this.items.length = 0;
    this.spawnGrazer(cx+1, cy+1);
    this.spawnGrazer(cx+1, cy-1);
    this.spawnGrazer(cx-1, cy+1);
    this.spawnHomeTree(cx,cy);
  },

  /**
   * Spawn a new critter on the given tile with the given type and image
   *
   * @param x Tiles across
   * @param y Tiles down
   */
  spawnCritter:function(type, imgId, moveFrequency, x,y) {
    var image = getImage(imgId);
    var critter = {
      type: type,
      image: image,
      x: x, y: y,

      // Random movement around the tile
      moveFrequency:moveFrequency,
      nextMoveTime: Date.now() + (0.5 + Math.random()) * moveFrequency * 1000,
      moving:false,
      movingTo:{x:0,y:0},
      moveSpeed: 0.25 // Tiles per second
    };
    this.critters.push(critter);
    return critter;
  },

  /**
   * Spawn a new grazer on the given tile.
   * @param x Tiles across
   * @param y Tiles down
   */
  spawnGrazer:function(x,y) {
    var grazer = this.spawnCritter(CritterType.GRAZER, 'grazer', 3.0, x, y);
    return grazer;
  },

  /**
   * Loop through the critters and "move" them around in their tile to give
   * some life to the game.
   */
  moveCritters:function() {
    this.critters.forEach(function(critter) {
      if(critter.moving) {
        var dx = critter.movingTo.x - critter.x;
        var dy = critter.movingTo.y - critter.y;
        var step = critter.moveSpeed * pc.device.elapsed * 0.001;
        if(dx*dx + dy*dy <= step*step) {
          // Arrived!
          critter.x = critter.movingTo.x;
          critter.y = critter.movingTo.y;
          critter.moving = false;
          critter.nextMoveTime = pc.device.lastFrame + (0.9 + Math.random()*0.2) * critter.moveFrequency * 1000;
        } else {
          var moveAngle = Math.atan2(dx, dy);
          critter.x += Math.sin(moveAngle) * step;
          critter.y += Math.cos(moveAngle) * step;
        }
      } else if(pc.device.lastFrame >= critter.nextMoveTime) {
        critter.moving = true;
        critter.movingTo.x = Math.round(critter.x) + (Math.random()*0.9) - 0.45;
        critter.movingTo.y = Math.round(critter.y) + (Math.random()*0.9) - 0.45;
      }
    }, this);
  },

  spawnDung:function(x,y) {
    this.spawnItem(ItemType.DUNG, 'dung', x, y);
  },

  spawnItem:function(type,imgId,x,y) {
    var item = {
      type:type,
      image:getImage(imgId),
      x:x,
      y:y,
      spawnTime:Date.now(),
      dropTime:Date.now()
    };
    this.items.push(item);
    return item;
  },

  haveItemOnTile:function(type, x, y) {
    x = Math.round(x);
    y = Math.round(y);
    var items = this.items;
    for(var i=0; i < items.length; i++) {
      var item = items[i];
      if(item.type == type && Math.round(item.x) == x && Math.round(item.y) == y) {
        return true;
      }
    }
    return false;
  },

  haveDungOnTile:function(x, y) {
    return this.haveItemOnTile(ItemType.DUNG, x, y);
  },

  /**
   * Spawn manure where appropriate
   */
  dropDungFromGrazers:function() {
    var spawnRate = 10.0;
    this.critters.forEach(function(critter) {
      if(critter.type == CritterType.GRAZER) {
        // Chance of spawning manure this round is equal to the
        // length of the last frame (s) / average spawn rate (s/unit) = num units to spawn this frame
        var r = Math.random();
        if(r < (pc.device.elapsed / (spawnRate * 1000))) {
          if(!this.haveDungOnTile(critter.x, critter.y)) {
            //console.log('Dropping dung ...', r, spawnRate, pc.device.elapsed / spawnRate * 1000);
            this.spawnDung(critter.x-0.1, critter.y-0.1);
          }
        }
      }
    }, this);
  },

  process:function() {
    this.dropDungFromGrazers();
    this.moveCritters();

  },

  /**
   * Spawn a tree on the given tile with the given type and image
   *
   * @param x Tiles across
   * @param y Tiles down
   */
  spawnTree:function(type, imgId, x,y) {
    this.trees.push({
      type: type,
      image: getImage(imgId),
      x:x,
      y:y
    });
  },

  /**
   * Spawn the home tree on the given tile
   *
   * @param x Tiles across
   * @param y Tiles down
   */
  spawnHomeTree:function(x,y) {
    this.spawnTree(TreeType.HOME, 'base-tree', x, y);
  }
});