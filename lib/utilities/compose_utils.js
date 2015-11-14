/** COMPOSE UTILS - Utilities specifically for the creation of Haikus. */

ComposeUtils = {
  /**
   * Takes a body of text and builds a 3-dimensional array with it:
   * Lines, words, syllables.
   * @param {string} body - Our Haiku!
   */
  buildSyllablesArray: function(body) {
    // Split into lines
    let lines = _.compact(body.split('<br>'));

    // Break each line into an array of its words
    return lines.map( line => {
      let words = _.compact(line.replace('&nbsp;', '').split(' '));

      // Split each word into its syllables.
      return words.map( word => ParseSyllables(word) );
    });
  },

  /**
   * Takes a 3-dimensional array built by `buildSyllablesArray` and joins it
   * into a presentation-ready Haiku.
   * @param {array} lines - our input array.
   */
  formatSyllables: function(lines, body) {
    // Example output:
    // [ [ ['first'], ['line'] ], [ ['sec', 'ond'], ['line'] ] ]

    // If the most recent action was a new line, we need to ignore and preserve it
    let endsWithBreak = _.endsWith(body, '<br><br>');

    let formattedBody = lines.map( (words) => {
      return words.map( (syllables) => {
        return syllables.map( (syllable) => {
          return `<span class='syllable'>${syllable}</span>`;
        }).join('')
      }).join(' ')
    }).join('<br>');

    // Replace any removed final linebreak
    if ( endsWithBreak ) formattedBody += "<br><br>";

    return formattedBody;

  },

  /**
   * The default behaviour (in contentEditable containers, when the 'enter' key
   * is pressed) varies widely across browsers. This method makes it consistent,
   * and sets newlines as <br> tags.
   */
  handleEnterKey: function(ev) {
    if (ev.keyCode !== 13) {
      return true
    }
    document.execCommand('insertHTML', false, '<br><br>');
    return false;
  }
};
