var HudLayer = pc.Layer.extend('HudLayer', {}, {
  digits:[],
  colon:null,
  init:function(name, zIndex) {
    this._super(name, zIndex);
    for(var i=0; i < 10; i++) {
      this.digits.push(getImage('clock-#-'+i));
    }
    this.colon = getImage('clock-colon');
  },

  draw:function() {
    this.drawTimeRemaining();
  },

  drawTimeRemaining:function() {
    var timeLeft = pc.device.game.getTimeLeft();
    var seconds = Math.floor(timeLeft / 1000);
    var s1 = seconds % 10;
    var s2 = Math.floor((seconds % 60) / 10);
    var minutes = Math.floor(seconds / 60);
    var m1 = minutes % 10;
    var m2 = Math.floor((minutes % 60) / 10);
    var hours = Math.floor(minutes / 60);
    var images = [this.digits[hours], this.colon,
           this.digits[m2], this.digits[m1], this.colon,
           this.digits[s2], this.digits[s1]];
    var width = 0;
    images.forEach(function(img) { width += img.width; });
    var x = (pc.device.canvasWidth - width) / 2;
    var y = 10;
    images.forEach(function(img) {
      img.draw(pc.device.ctx, x, y);
      x += img.width;
    });
  }
});