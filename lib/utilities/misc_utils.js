Utils = {
  stripHTML: function(code) {
    code.replace(/<(?:.|\n)*?>/gm, '');
  }
}