/** COMPOSE UTILS - Utilities specifically for the creation of Haikus. */

ComposeUtils = {
  /**
   * Takes HTML input and wraps <span>s around each syllable.
   * @param {string} body - Our Haiku!
   */
  wrapSyllables: function(body) {
    // If the most recent action was a new line, we need to ignore and preserve it
    let endsWithBreak = _.endsWith(body, '<br><br>');

    // Split into lines
    let lines = _.compact(body.split('<br>'));

    // Break each line into an array of its words
    lines = lines.map( line => {
      let words = _.compact(line.split(' '));

      words = words.map( word => {
        // Break each word into an array of its syllables
        let syllables = ParseSyllables(word);

        // Wrap each syllable in a span
        syllables = syllables.map( syllable => `<span class='syllable'>${syllable}</span>` );

        // Join each syllable
        return syllables.join("");
      });

      // join each word with a space
      return words.join(" ");
    });

    // Join each line with a linebreak
    lines = lines.join("<br>");

    // Replace any removed final linebreak
    if ( endsWithBreak ) lines += "<br><br>";

    return lines;
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
