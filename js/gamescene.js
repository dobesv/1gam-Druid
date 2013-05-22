
GameScene = pc.Scene.extend('GameScene',
    {

    },
    {

      mapLayer:null,
      map:null,

      onAction:function(actionName, event, pos) {
        console.log("Action: "+actionName+' at '+pos.x+","+pos.y+" (world mouse xy: "+this.game.canvasMouseX()+","+this.game.canvasMouseY()+")  (world xy: "+this.game.canvasX(pos.x)+","+this.game.canvasY(pos.y)+")");
        if(actionName == 'press') {
          // TODO Check if they are dragging something else ...

          this.draggingMap = true;
          this.draggingMapX = this.game.canvasMouseX() + this.mapLayer.origin.x;
          this.draggingMapY = this.game.canvasMouseY() + this.mapLayer.origin.y;
          //console.log('Dragging the map ... '+this.draggingMapX+","+this.draggingMapY+" origin is "+this.mapLayer.origin.x+","+this.mapLayer.origin.y);
        } else if(actionName == 'release') {
          this.draggingMap = false;
        }
//        if(this.game.levelStarted == false)
//          return;
//
//        var self = this;
//        var whatIsUnderTheMouse = function whatIsUnderTheMouse() {
//          var x = this.game.canvasX(pos.x);
//          var y = this.game.canvasY(pos.y);
//          //console.log(actionName + ' for scene at '+x+","+y);
//          var foundPivot = null;
//          var grid = self.grid;
//          self.grid.pivots.forEach(function(pivot) {
//            var leftX = grid.columnX(pivot.column)-filterOffset*grid.scale;
//            var rightX = grid.columnX(pivot.column+1)+filterOffset*grid.scale;
//            var topY = grid.rowY(pivot.row)-filterOffset*grid.scale;
//            var bottomY = grid.rowY(pivot.row+1)+filterOffset*grid.scale;
//            if(x >= leftX && x <= rightX && y >= topY && y <= bottomY) {
//              foundPivot = pivot;
//            }
//          });
//          return foundPivot;
//        }.bind(this);
//        if(actionName == 'press') {
//          this.pressed = whatIsUnderTheMouse();
//        } else if(actionName == 'release') {
//          if(!this.pressed)
//            return;
//          var onWhat = whatIsUnderTheMouse();
//          if(onWhat === this.pressed) {
//            onWhat.handleClick();
//            event.preventDefault();
//          }
//        } else if(actionName == 'touch') {
//          var onWhat = whatIsUnderTheMouse();
//          if(onWhat) {
//            onWhat.handleClick();
//            event.preventDefault();
//          }
//        }
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
        }

        this.map.process();
      },
      onResize:function (width, height) {
        // pretend its 1024,768 because of our scaling hack
        this._super(1024,768);
      },
      getScreenRect:function() {
        return this.game.getScreenRect();
      }

    });
