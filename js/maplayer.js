var MapLayer = pc.IsoTileLayer.extend("MapLayer", {}, {

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
    this.tileMap.trees.forEach(function(tree) {
      var screenX = this.tileScreenX(tree.x, tree.y) + (this.tileMap.tileWidth - tree.image.width)/2;
      var screenY = this.tileScreenY(tree.x, tree.y) + this.tileMap.tileHeight/2 - tree.image.height;
      tree.image.draw(pc.device.ctx, screenX, screenY);
    }, this);

    this.tileMap.critters.forEach(function(critter) {
      var screenX = this.tileScreenX(critter.x, critter.y) + (this.tileMap.tileWidth - critter.image.width)/2;
      var screenY = this.tileScreenY(critter.x, critter.y) + this.tileMap.tileHeight/2 - critter.image.height;
      critter.image.draw(pc.device.ctx, screenX, screenY);
    }, this);
  }
});