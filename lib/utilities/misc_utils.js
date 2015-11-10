Utils = {
  stripHTML: function(code) {
    code.replace(/<(?:.|\n)*?>/gm, '');
  },
  jumpToEnd: function(el) {
    var range,selection;
    
    // Create a range (a range is a like the selection but invisible)
    range = document.createRange();
    
    // Select the entire contents of the element with the range
    range.selectNodeContents(el);
    
    // collapse the range to the end point. false means collapse to end rather than the start
    range.collapse(false);
    
    // get the selection object (allows you to change selection)
    selection = window.getSelection();
    
    // remove any selections already made
    selection.removeAllRanges();
    
    // make the range you have just created the visible selection
    selection.addRange(range);
  }
}