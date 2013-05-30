
GameScene = pc.Scene.extend('GameScene',
    {

    },
    {

      mapLayer:null,
      map:null,
      draggingObject:null,

      onAction:function(actionName, event, pos) {
        console.log("Action: "+actionName+' at '+pos.x+","+pos.y+" (world mouse xy: "+this.game.canvasMouseX()+","+this.game.canvasMouseY()+")  (world xy: "+this.game.canvasX(pos.x)+","+this.game.canvasY(pos.y)+")");
        var x = this.game.canvasX(pos.x);
        var y = this.game.canvasY(pos.y);
        if(actionName == 'press') {
          // TODO Check if they are dragging something else ...
          var canDrag = function(obj) {
            return 'dragging' in obj &&
                (!('readyTime' in obj) || obj.readyTime <= pc.device.lastFrame); }
          var objectToDrag = this.mapLayer.findObjectOnScreen(x, y, canDrag);
          if(objectToDrag == null) {
            this.draggingMap = true;
            this.draggingMapX = x + this.mapLayer.origin.x;
            this.draggingMapY = y + this.mapLayer.origin.y;
            //console.log('Dragging the map ... '+this.draggingMapX+","+this.draggingMapY+" origin is "+this.mapLayer.origin.x+","+this.mapLayer.origin.y);
          } else {
            this.draggingObject = objectToDrag;
          }
        } else if(actionName == 'release') {
          this.draggingMap = false;
          if(this.draggingObject) {
            this.dragItemTo(this.draggingObject, x, y, false);
          }
          this.draggingObject = null;
        }
      },

      init:function (game)
      {
        this._super();

        this.game = game;
        if(!(pc.device.isiPad || pc.device.isiOS)) {
          pc.device.input.bindAction(this, 'press', 'MOUSE_BUTTON_LEFT_DOWN');
          pc.device.input.bindAction(this, 'release', 'MOUSE_BUTTON_LEFT_UP');
        }
        pc.device.input.bindAction(this, 'touch', 'TOUCH');
        this.setViewPort(0, 0, 1024, 768);

        this.addLayer(this.bgLayer = new ImageLayer('bg', 'background', 0));
        this.addLayer(this.mapLayer = new MapLayer(10));
        this.addLayer(this.hudLayer = new HudLayer('hud', 20));
        this.mapLayer.center();
        this.map = this.mapLayer.tileMap;

      },

      process:function() {
        this._super();

        if(this.draggingMap) {
          var mx = this.game.canvasMouseX();
          var my = this.game.canvasMouseY();
          if(this.mapLayer.setOrigin(this.draggingMapX - mx, this.draggingMapY - my)) {
            //console.log('changed origin by dragging: '+this.mapLayer.origin.x+","+this.mapLayer.origin.y);
          }
        } else if(this.draggingObject) {
          // TODO Maybe this should be tied to mousemove, that'd make it easier to tie to touch gestures later
          this.dragItemTo(this.draggingObject, this.game.canvasMouseX(), this.game.canvasMouseY(), true);
        }

        this.map.process();
      },

      dragItemTo: function(item, x, y, dragging) {
        var tileX = this.mapLayer.screenTileX(x,y);
        var tileY = this.mapLayer.screenTileY(x,y);
        var xx = this.mapLayer.tileScreenX(tileX, tileY);
        var yy = this.mapLayer.tileScreenY(tileX, tileY);
        //console.log('Drag item to '+x+','+y+' --> '+tileX+','+tileY+" --> "+xx+','+yy);
        this.map.dragItemTo(item, tileX, tileY, dragging);
      },

      onResize:function (width, height) {
        // pretend its 1024,768 because of our scaling hack
        this._super(1024,768);
      },
      getScreenRect:function() {
        return this.game.getScreenRect();
      }

    });
