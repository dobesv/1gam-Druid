EndScene = MenuScene.extend('EndScene', {}, {

  init:function() {
    this._super({
      bg: "end-screen",
      buttons:{
        'play-again':{
          x:530, y:450, onClick:function() { pc.device.game.showStartMenuScene(); }
        }
      }
    });
  },

  onActivated:function() {
    this.score = pc.device.game.calculateScore();
    console.log('Score: '+this.score);
  },

  process:function() {
    this._super();
    this.drawScore();
  },

  drawScore:function() {
    var hud = pc.device.game.gameScene.hudLayer;
    var digits = hud.digits;
    var images = [];
    var width=0;
    for(var temp = this.score; temp > 0; temp = Math.floor(temp / 10)) {
      var digit = digits[temp % 10];
      images.push(digit);
      width += digit.width;
    }
    if(images.length == 0) images.push(digits[0]);
    else images.reverse();
    var x = 630 - width/2;
    var y = 375;
    images.forEach(function(im) {
      im.draw(pc.device.ctx, x, y);
      x += im.width;
    });

  }

});