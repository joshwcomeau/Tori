ComposeUtils = {
  getCursorOffset: function(el) {
    /*
      Adapted from StackOverflow answer by Tim Down
      http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
    */
    var cursorOffset = 0;
    var doc = el.ownerDocument || el.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if ( typeof win.getSelection != "undefined" ) {
      sel = win.getSelection();
      console.log("selection", sel, 'range count', sel.rangeCount);
      if (sel.rangeCount > 0) {
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        cursorOffset = preCaretRange.toString().length;
      }
    } else if ( (sel = doc.selection) && sel.type != "Control" ) {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(el);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      cursorOffset = preCaretTextRange.text.length;
    }
    
    return cursorOffset;
  },
  setCursorOffset: function(el, position) {
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
  },
  
  wrapImageUrl: function(url) {
    return `url('${url}')`;
  }

}