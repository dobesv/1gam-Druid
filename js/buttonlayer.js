
ButtonLayer = pc.Layer.extend('ButtonLayer', {}, {

  buttons:[],
  pressed:null,

  init:function(name, zIndex, buttons) {
    this._super(name, zIndex);
    if(buttons) {
      buttons.forEachProperty(this.addButton, this);
    }
  },

  addButton:function(id, opts) {
    var images = {
      up:getImage('but-'+id+'-up'),
      down:getImage('but-'+id+'-down'),
      hover:getImage('but-'+id+'-hover')
    };
    var but = {
      id: id,
      x: opts.x,
      y: opts.y,
      onClick: opts.onClick,
      width: images.up.width,
      height: images.up.height,
      images: images,
      screenRect: pc.Rect.create(),
      getScreenRect:function() {
        this.screenRect.x = pc.device.game.screenX(this.x);
        this.screenRect.y = pc.device.game.screenY(this.y);
        this.screenRect.w = Math.round(pc.device.game.scale * this.width);
        this.screenRect.h = Math.round(pc.device.game.scale * this.height);
        return this.screenRect;
      }
    };
    this.buttons.push(but);
    pc.device.input.bindAction(this, 'down', 'MOUSE_BUTTON_LEFT_DOWN', but);
    pc.device.input.bindAction(this, 'up', 'MOUSE_BUTTON_LEFT_UP', but);
    pc.device.input.bindAction(this, 'down', 'TOUCH', but);
    pc.device.input.bindAction(this, 'up', 'TOUCH_END', but);
  },

  onAction:function(actionName, event, pos, uiTarget) {
    switch(actionName) {
      case 'down':
        this.pressed = uiTarget;
        break;
      case 'up':
        if(uiTarget == this.pressed) {
          uiTarget.onClick();
        }
        this.pressed = null;
        break;
    }
  },

  draw:function() {
    this.buttons.forEach(function(but) {
      var img = but.images.up;
      if(this.pressed) {
        if(this.pressed === but) {
          img = but.images.down;
        }
      } else {
        var mouseX = pc.device.game.canvasMouseX();
        var mouseY = pc.device.game.canvasMouseY();
        if(mouseX > but.x && mouseX < (but.x + but.width) &&
           mouseY > but.y && mouseY < (but.y + but.height)) {
          img = but.images.hover;
        }
      }
      img.draw(pc.device.ctx, but.x, but.y);
    }, this);
  }
});