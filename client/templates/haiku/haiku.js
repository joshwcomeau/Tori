Template.haiku.helpers({
  haikuAttrs: function() {
    let haikuClass  = 'haiku';
    haikuClass += this.backgroundImage ? ' with-bg-image' : ' with-white-bg';
    let haikuStyle  = this.backgroundImage ? `background-image: url('${this.backgroundImage}');` : '';

    return {
      class:                    haikuClass,
      style:                    haikuStyle,
      'data-text-color':        this.textColor,
      'data-text-align':        this.textAlign,
      'data-text-valign':       this.textValign,
      'data-background-align':  this.backgroundAlign,
      'data-background-valign': this.backgroundValign,
      'data-overlay-color':     this.overlayColor,
      'data-overlay-direction': this.overlayDirection,
      'data-show-overlay':      this.showOverlay,
      'data-show-background':   this.showBackground
    };
  }
});
