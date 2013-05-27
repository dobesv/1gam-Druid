var MapLayer = pc.IsoTileLayer.extend("MapLayer", {}, {
  drawList:[],

  init:function(zIndex) {
    var tileSet = new pc.TileSet(new pc.SpriteSheet({
      frameWidth:128,
      frameHeight:128,
      image:getImage('iso-128x128')}));
    // name, usePrerendering, tileMap, tileSets
    this._super("map", false, new GameMap([tileSet]), [tileSet]);
    this.setZIndex(zIndex);
    this.tileMap.generate();
  },

  center:function() {
    var mapHeight = this.tileMap.tilesHigh * this.tileMap.tileHeight;
    var screenHeight = this.scene.getScreenRect().h;
    this.setOrigin(0, Math.round((mapHeight-screenHeight)/2));
  },

  findObjectOnScreen:function(x,y,pred) {
    var choices = [];
    for(var i=0; i < this.drawList.length; i++) {
      var obj = this.drawList[i];
      if(x >= obj.image.x && x < (obj.image.x + obj.image.width) && (!pred || pred(obj))) {
        choices.push(obj);
      }
    }
    choices.sort(function(a,b) {
      var aDistSqr = pc.Math.sqr(a.image.x + a.image.x/2 - x)+pc.Math.sqr(a.y + a.image.height/2 - y);
      var bDistSqr = pc.Math.sqr(b.image.x + b.image.x/2 - x)+pc.Math.sqr(b.y + b.image.height/2 - y);
      return aDistSqr - bDistSqr;
    });
    if(choices.length==0) {
      return null;
    } else {
      return choices[0];
    }
  },

  draw:function() {
    this._super();
    var drawList = this.drawList;
    var drawListLength = 0;
    var addToDrawList = function(obj,vanchor) {
      var x = obj.x;
      var y = obj.y;
      var image = obj.image;
      var screenX = image.x = Math.round(this.tileScreenX(x, y) + (this.tileMap.tileWidth - image.width) / 2);
      var mapY = this.tileScreenY(x, y);
      var screenY = image.y = Math.round(mapY + this.tileMap.tileHeight / 2 - (image.height * vanchor));
      if(screenX + image.width < 0 || screenX > this.scene.viewPort.w ||
         screenY + image.height < 0 || screenY > this.scene.viewPort.h) {
        // Off-screen
        return;
      }
      obj.mapY = mapY;
      if(drawListLength == drawList.length) {
        drawList.push(obj);
      } else {
        drawList[drawListLength] = obj;
      }
      drawListLength++;
    }.bind(this);
    var addObjectToDrawList = function(obj) {
      addToDrawList(obj, 0.5);
    };
    this.tileMap.critters.forEach(addObjectToDrawList, this);
    this.tileMap.items.forEach(addObjectToDrawList, this);

    this.tileMap.trees.forEach(function(obj) {
      addToDrawList(obj, 1);
    }, this);

    drawList.length = drawListLength;
    drawList.sort(function(a,b) {
      return a.mapY - b.mapY;
    });
    drawList.forEach(function(elt) {

      var ready = !('readyTime' in elt) || pc.device.lastFrame > elt.readyTime;
      var alpha = ready ? 1 : 0.25 + 0.75*((pc.device.lastFrame - elt.spawnTime) / (elt.readyTime - elt.spawnTime));
      elt.image.setAlpha(alpha);
      elt.image.setScale(alpha,alpha);
      var x = elt.image.x + (1-alpha)*0.5*elt.image.width;
      var y = elt.image.y + (1-alpha)*0.5*elt.image.height;
      elt.image.draw(pc.device.ctx, x, y);
    });
  }
});