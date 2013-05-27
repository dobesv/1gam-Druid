

GameMap = pc.TileMap.extend("GameMap", {}, {

  critters:[],
  trees:[],
  items:[],

  init:function(tileSets) {
    this._super(tileSets, 75, 75);

    for(var k in TileType) {
      var type = TileType[k];
      var tileIds = Tiles[k];
      if(tileIds) tileIds.forEach(function(tileId) {this.getTileSetForTileId(tileId).addProperty(tileId+1, 'type', type); }, this)
      Tiles[type] = tileIds;
    }
  },

  generate:function() {
    this._super(Tiles.SAND[0]);
    var cx = Math.floor(this.tilesWide/2);
    var cy = Math.floor(this.tilesHigh/2);
    this.paint(cx-2,cy-2,5,5,Tiles.GRASS[0]);
    this.critters.length = 0;
    this.trees.length = 0;
    this.items.length = 0;
    this.spawnGrazer(cx+1.1, cy+1.5);
    this.spawnGrazer(cx+1.2, cy-0.4);
    this.spawnGrazer(cx-0.7, cy+1.2);
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
      remove: false,
      x: x, y: y,
      dragging: true,

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

  getTileType:function(x,y) {
    var tileId = parseInt(this.getTile(Math.floor(x), Math.floor(y)))+1;
    if(tileId == 0) {
      return '?';
    }
    var tileSet = this.getTileSetForTileId(tileId);
    var properties = tileSet.getProperties(tileId);
    var type = properties && properties.get('type');
    if(!type)
      console.log('No type for tile ID '+tileId);
    return type || '?';
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
        critter.movingTo.x = Math.floor(critter.x) + (Math.random()*0.9) + 0.05;
        critter.movingTo.y = Math.floor(critter.y) + (Math.random()*0.9) + 0.05;
      }
    }, this);
  },

  spawnDung:function(x,y,readyTime) {
    return this.spawnItem(ItemType.DUNG, 'dung', x, y, readyTime);
  },

  spawnGrassSeed:function(x,y,readyTime) {
    return this.spawnItem(ItemType.GRASS_SEED, 'seed-grass', x, y, readyTime);
  },

  spawnItem:function(type,imgId,x,y,readyTime) {
    var item = {
      type:type,
      image:getImage(imgId),
      remove:false,
      x:x,
      y:y,
      dragging: true,
      spawnTime:pc.device.lastFrame,
      dropTime:pc.device.lastFrame,
      readyTime:pc.checked(readyTime, pc.device.lastFrame)
    };
    this.items.push(item);
    return item;
  },

  haveObjectOnTile:function(list, type, x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    for(var i=0; i < list.length; i++) {
      var item = list[i];
      if(item.type == type && Math.floor(item.x) == x && Math.floor(item.y) == y) {
        return true;
      }
    }
    return false;
  },

  haveItemOnTile:function(type, x, y) {
    return this.haveObjectOnTile(this.items, type, x, y);
  },

  haveDungOnTile:function(x, y) {
    return this.haveItemOnTile(ItemType.DUNG, x, y);
  },

  haveGrassOnTile:function(x, y) {
    switch(this.getTileType(x, y)) {
      case TileType.GRASS:
      case TileType.DEEP_GRASS:
        return true;
      default:
        return false;
    }
  },

  /**
   * Spawn manure where appropriate
   */
  applyCritterEffects:function() {
    this.critters.forEach(function(critter) {
      if(critter.type == CritterType.GRAZER) {
        // Chance of spawning manure this round is equal to the
        // length of the last frame (s) / average spawn rate (s/unit) = num units to spawn this frame
        if(this.haveGrassOnTile(critter.x, critter.y) && !this.haveDungOnTile(critter.x, critter.y)) {
          var r = Math.random();
          if(r < (pc.device.elapsed / (DUNG_SPAWN_RATE * 1000))) {
            //console.log('Dropping dung ...', r, DUNG_SPAWN_RATE, pc.device.elapsed / DUNG_SPAWN_RATE * 1000);
            this.spawnDung(critter.x-0.1, critter.y-0.1, pc.device.lastFrame + 5000);
          }
        }
      }
    }, this);
  },

  setTileType:function(x,y,type) {
    this.setTile(Math.floor(x), Math.floor(y), Tiles[type]);
  },

  markForRemoval: function(obj) {
    obj.remove = true;
  },

  applyRemovals: function (lst) {
    var d=0;
    for(var i=0; i < lst.length; i++) {
      var obj = lst[i];
      if(! obj.remove) {
        if(d < i) lst[d] = obj;
        d++;
      }
    }
    lst.length = d;
  },

  /**
   * Apply the effects of items - manure fertilizes the ground or kills grass, for example
   */
  applyItemEffects:function() {
    this.items.forEach(function(item) {
      // Skip items that are not "ready"
      if(item.readyTime > pc.device.lastFrame)
        return;
      var sittingTime = pc.device.lastFrame - item.dropTime;
      var tileType = this.getTileType(item.x, item.y);
      switch(item.type) {
        case ItemType.DUNG:
          // If on sand, convert to fertile soil.  If on grass, convert to greener grass.  If on greener grass ... ?
          switch(tileType) {
            case TileType.GRASS:
                if(sittingTime > 10000) {
                  this.setTileType(item.x, item.y, TileType.DEEP_GRASS);
                  this.markForRemoval(item); // Mark for removal
                }
              break;

            case TileType.SAND:
                if(sittingTime > 10000) {
                  this.setTileType(item.x, item.y, TileType.DIRT);
                  this.markForRemoval(item);
                }
              break;
            default:
              if(sittingTime > 180000) {
                this.markForRemoval(item); // expired
              }
              break;
          }
          break;

        case ItemType.GRASS_SEED:
          // If we're on fertile ground, gradually convert to grass
          switch(tileType) {
            case TileType.DIRT:
              if(sittingTime > 10000) {
                this.setTileType(item.x, item.y, TileType.GRASS);
                this.markForRemoval(item);
              }
              break;
            case TileType.SAND:
              if(sittingTime > 5000) {
                this.markForRemoval(item); // expired
              }
              break;

            default:
              if(sittingTime > 300000) {
                this.markForRemoval(item); // expired
              }
              break;
          }
          break;
      }
    }, this);
  },

  applyTreeEffects:function() {
    this.trees.forEach(function(tree) {
      switch(tree.type) {
        case TreeType.HOME:
          for(var dx=-2; dx <= 3; dx++) {
            for(var dy=-2; dy <= 3; dy++) {
              var shadeX = Math.floor(tree.x + dx);
              var shadeY = Math.floor(tree.y + dy);
              var shadedTileType = this.getTileType(shadeX, shadeY);
              if(shadedTileType == TileType.DEEP_GRASS &&
                  !this.haveItemOnTile(ItemType.GRASS_SEED, shadeX, shadeY)) {
                this.spawnGrassSeed(shadeX + Math.random()*0.99, shadeY + Math.random()*0.99, pc.device.lastFrame + 30000);
              }
            }
          }
          break;
      }
    },this);
  },

  process:function() {
    this.applyCritterEffects();
    this.applyItemEffects();
    this.applyTreeEffects();
    this.moveCritters();
    this.applyRemovals(this.critters);
    this.applyRemovals(this.items);
    this.applyRemovals(this.trees);
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
  },

  dragItemTo:function(item,x,y,dragging) {
    item.dragging = dragging;
    item.x = x;
    item.y = y;
    item.dropTime = pc.device.lastFrame;
    if('moving' in item) {
      // Reset movement state
      item.moving = false;
    }
  }

});