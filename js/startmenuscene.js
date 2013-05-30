StartMenuScene = MenuScene.extend('StartMenuScene', {}, {
  game:null,

  init:function(game) {
    this.game = game;
    var buttons = {};
    var y = 320;
    [5, 10, 15, 20, 60].forEach(function(mins) {
      buttons[mins+"min"] = {x:530, y:y,
        onClick: function() {
          console.log(mins+' minute game selected!');
          pc.device.game.setTimeLimit(mins);
          pc.device.game.startGame();
        }};
      y += 50;
    });
    this._super({
      bg: "start-screen",
      buttons: buttons
    });
  }
});
