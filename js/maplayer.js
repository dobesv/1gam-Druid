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


  draw:function() {
    this._super();
    var drawList = this.drawList;
    var drawListLength = 0;
    var addToDrawList = function(x,y,image,vanchor) {
      var screenX = Math.round(this.tileScreenX(x, y) + (this.tileMap.tileWidth - image.width) / 2);
      var mapY = this.tileScreenY(x, y);
      var screenY = Math.round(mapY + this.tileMap.tileHeight / 2 - (image.height * vanchor));
      if(screenX + image.width < 0 || screenX > this.scene.viewPort.w ||
         screenY + image.height < 0 || screenY > this.scene.viewPort.h) {
        // Off-screen
        return;
      }
      var elt = {x:screenX,y:screenY,image:image,mapY:mapY};
      if(drawListLength == drawList.length) {
        drawList.push(elt);
      } else {
        drawList[drawListLength] = elt;
      }
      drawListLength++;
    }.bind(this);
    var addObjectToDrawList = function(obj) {
      addToDrawList(obj.x, obj.y, obj.image, 0.5);
    };
    this.tileMap.critters.forEach(addObjectToDrawList, this);
    this.tileMap.items.forEach(addObjectToDrawList, this);

    this.tileMap.trees.forEach(function(obj) {
      addToDrawList(obj.x, obj.y, obj.image, 1);
    }, this);

    drawList.length = drawListLength;
    drawList.sort(function(a,b) {
      return a.mapY - b.mapY;
    });
    drawList.forEach(function(elt) {
      elt.image.draw(pc.device.ctx, elt.x, elt.y);
    });
  }
});