MenuScene = pc.Scene.extend('MenuScene', {}, {
  bgimage:null,

  init:function(opts) {
    this._super();
    if('bg' in opts) {
      this.addLayer(new ImageLayer(opts.bg, 'menu background', 0));
    }
    if('buttons' in opts) {
      this.addLayer(this.buttonLayer = new ButtonLayer('menu buttons', 1, opts.buttons));
    }
  }
});
