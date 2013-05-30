

var filterOffset=80;
var filterGridSize = filterOffset*2;
var pivotGridSize = filterGridSize*2;
var globalScale=1;


TheGame = pc.Game.extend('TheGame',
    {},
    {
      gameScene:null,
      scale:1,
      musicPlaying:true,
      muted:false,
      screenRect:null,
      timeLimit:60,
      gameStartTime:0,

      onReady:function ()
      {
        this._super(); // call the base class' onReady

        this.musicPlaying = getBoolCookie('music', this.musicPlaying);
        this.muted = getBoolCookie('muted', this.muted);

        // disable caching when developing
        pc.device.devMode = ! window.production;
        if (pc.device.devMode && !pc.device.isCocoonJS)
          pc.device.loader.setDisableCache();

        var loadImage = function(name) {
          var path = 'images/'+name;
          var id = name.replace(/\....$/, "");
          pc.device.loader.add(new pc.Image(id, path));
        };
        var loadSound = function(id, maxPlaying) {
          var path = 'sounds/'+id;
          if (pc.device.soundEnabled)
            pc.device.loader.add(new pc.Sound(id, path, ['ogg','mp3'], maxPlaying || 1));
        };
        // load up resources
        loadImage('bg.jpg');
        loadImage('start-screen.jpg');
        loadImage('end-screen.jpg');
        loadImage("spritesheet.png");
        loadImage("iso-128x128.png");

//        loadSound('door_open_sound');
//        loadSound('applause');
//        loadSound('level_complete_sound');
//        loadSound('beep');
//        loadSound('pivot_sound', 5);
//        loadSound('music');

        // fire up the loader (with a callback once done)
        pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
      },

      onLoading:function (percentageComplete) {
        var cw = pc.device.canvasWidth;
        var ch = pc.device.canvasHeight;
        var barHeight = Math.round(ch/10);
        var barMaxWidth = cw/2;
        var barLeft = Math.round(cw/4);
        var barTop = Math.round(ch/2);
        var barWidth = Math.round(barMaxWidth * percentageComplete / 100);
        var barEmpty = barMaxWidth - barWidth;
        var ctx = pc.device.ctx;

        var border = Math.ceil(barHeight/5);
        ctx.clearRect(0, 0, cw, ch);
        ctx.fillStyle = "#DDD";
        ctx.fillRect(barLeft - border, barTop - border, barMaxWidth+border*2, barHeight+border*2);
        ctx.fillStyle = "#888";
        ctx.fillRect(barLeft, barTop, barWidth, barHeight);
        ctx.fillStyle = "#000";
        ctx.fillRect(barLeft+barWidth, barTop, barEmpty, barHeight);

        ctx.font = "normal "+Math.round(barHeight/2)+"px Verdana";
        ctx.fillStyle = "#555";
        ctx.textAlign = 'center';
        var tw = ctx.measureText(percentageComplete + '%').width;
        ctx.fillText(percentageComplete + '%',
            Math.round(barLeft + (barMaxWidth - tw)/2),
            Math.round(barTop + barHeight*0.66));

      },

      onLoaded:function ()
      {
        if(this.gameScene) {
          console.log("onLoaded called an extra time ?");
          return;
        }

        // Erase loading screen
        var ctx = pc.device.ctx;
        ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

        this.startMenuScene = new StartMenuScene(this);
        this.addScene(this.startMenuScene, true);

        this.gameScene = new GameScene(this);
        this.addScene(this.gameScene, false);

        this.endScene = new EndScene(this);
        this.addScene(this.endScene, false);

//        if(this.musicPlaying && !this.muted)
//          this.startMusic();

        pc.device.input.bindAction(this, 'cheat', 'F8');
        pc.device.input.bindAction(this, 'end', 'ESC');
        pc.device.input.bindAction(this, 'toggleMusic', 'M');

      },

      startMusic:function() {
        playSound('music', 0.6, true);
        setBoolCookie('music', this.musicPlaying = true);
      },

      stopMusic:function() {
        stopSound('music');
        setBoolCookie('music', this.musicPlaying = false);
      },

      toggleMusic:function() {
        if(this.musicPlaying) this.stopMusic();
        else this.startMusic();
      },

      mute:function() {
        setBoolCookie(this.muted = true);
        stopSound('music');
      },

      unmute:function() {
        setBoolCookie('muted', this.muted = false);
        if(this.musicPlaying) this.startMusic();
      },

      toggleSound:function() {
        if(this.muted) this.unmute();
        else this.mute();
      },

      cycleSoundMode:function() {
        if(this.muted) {
          this.unmute();
          this.startMusic();
        } else if(this.musicPlaying) {
          this.stopMusic();
        } else {
          this.mute();
        }
      },

      onAction:function(actionName) {
        switch(actionName) {
          case 'cheat': break;
          case 'end':
            if(this.gameScene.active) this.showEndScene();
            else if(this.endScene.active) this.showStartMenuScene();
            break;
          case 'toggleMusic':
            this.toggleMusic();
            break;
        }
      },

      playDoorSound:function() {
      },

      startGame:function() {
        this.gameStartTime = pc.device.lastFrame;
        this.gameScene.map.generate();
        this.deactivateScene(this.startMenuScene);
        this.deactivateScene(this.endScene);
        this.activateScene(this.gameScene);
      },

      showEndScene:function() {
        this.deactivateScene(this.startMenuScene);
        this.deactivateScene(this.gameScene);
        this.activateScene(this.endScene);
      },

      showStartMenuScene:function() {
        this.deactivateScene(this.endScene);
        this.deactivateScene(this.gameScene);
        this.activateScene(this.startMenuScene);
      },

      process:function() {
        var cw = pc.device.canvasWidth;
        var ch = pc.device.canvasHeight;
        var virtualCanvasWidth = 1024;
        var virtualCanvasHeight = 768;
        var scale = this.scale = Math.min(cw/ virtualCanvasWidth, ch/ virtualCanvasHeight);
        pc.device.canvasWidth = virtualCanvasWidth;
        pc.device.canvasHeight = virtualCanvasHeight;
        var ctx = pc.device.ctx;
        ctx.setTransform(1,0,0,1,0,0);
        ctx.save();
        var dx = this.offsetX = Math.round(Math.max(0, (cw - pc.device.canvasWidth*scale) / 2));
        var dy = this.offsetY = Math.round(Math.max(0, (ch - pc.device.canvasHeight*scale) / 2));
        if(pc.device.isCocoonJS) {
          ctx.scale(1,-1);
          ctx.translate(0, -ch);
        }
        ctx.translate(dx,dy);
        ctx.scale(scale,scale);

        var ok = this._super();
        if(ok) {
          if(this.gameScene && this.gameScene.active) {
            if(this.getTimeLeft() <= 0) {
              this.showEndScene();
            }
          }
        }

        ctx.restore();
        if(dx > 0) {
          ctx.clearRect(0,0,dx,ch); // left side
          var right = virtualCanvasWidth*scale+dx;
          ctx.clearRect(right,0,cw-right,ch); // right side
        }
        if(dy > 0) {
          ctx.clearRect(0,0,cw,dy); // top
          var bottom = virtualCanvasHeight*scale+dy;
          ctx.clearRect(0,bottom,cw,ch-bottom); // bottom
        }
        pc.device.canvasWidth = cw;
        pc.device.canvasHeight = ch;
        return ok;
      },

      isPosOverImage: function(pos, image) {
        var x = this.canvasX(pos.x) - image.x;
        var y = this.canvasY(pos.y) - image.y;
        return (x >= 0 && x < image.width &&
                y >= 0 && y < image.height);
      },

      /** Convert an absolute unscaled screen coordinate to a scaled canvas coordinate */
      canvasX:function(x) {
        return Math.round((x - this.offsetX) / this.scale);
      },
      /** Convert an absolute unscaled screen coordinate to a scaled canvas coordinate */
      canvasY:function(y) {
        return Math.round((y - this.offsetY) / this.scale);
      },
      /** Convert a scaled canvas coordinate to an unscaled screen coordinate (to match against input events) */
      screenX:function(x) {
        return Math.round(x * this.scale + this.offsetX);
      },
      /** Convert a scaled canvas coordinate to an unscaled screen coordinate (to match against input events) */
      screenY:function(y) {
        return Math.round(y * this.scale + this.offsetY);
      },

      /** Get the current mouse position as a scaled coordinate */
      canvasMouseX:function() {
        return this.canvasX(pc.device.input.mousePos.x);
      },

      /** Get the current mouse position as a scaled coordinate */
      canvasMouseY:function() {
        return this.canvasY(pc.device.input.mousePos.y);
      },

      getScreenRect:function() {
        if(this.screenRect == null) {
          this.screenRect = pc.Rect.create(this.offsetX, this.offsetY, pc.device.canvasWidth, pc.device.canvasHeight);
        } else {
          this.screenRect.x = this.offsetX;
          this.screenRect.y = this.offsetY;
          this.screenRect.w = pc.device.canvasWidth;
          this.screenRect.h = pc.device.canvasHeight;
        }

        return this.screenRect;
      },

      setTimeLimit:function(minutes) {
        this.timeLimit = minutes * 60000;
      },

      getTimeLeft:function() {
        return Math.max(0, (this.gameStartTime + this.timeLimit) - pc.device.lastFrame);
      },

      calculateScore:function() {
        return this.gameScene.map.calculateScore();
      }

    });


