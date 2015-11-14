/** MISC UTILS - Generalized helpers that perform small, common tasks. */

Utils = {
  /**
   * Removes all XML characters from a block of text
   * @param {string} code - the block of text to be cleared of HTML/XML.
   */
  stripHTML: function(code) {
    code.replace(/<(?:.|\n)*?>/gm, '');
  },

  /**
   * Extracts and returns a substring wrapped between two delimiters.
   * @param {string} str - the block of text we're extracting from.
   * @param {string} start - the left-bracket, one or more characters.
   * @param {string} end - the right-bracket, one or more characters.
   */
  unwrap: function(str, start, end) {
    // If we don't provide an `end`, we'll use the `start` for both.
    end = ( typeof end === 'undefined') ? start : end;

    // Arrays are easier to work with than strings. Convert to one.
    let arr = str.split('');

    // Find the index of the first and last instances of delimiter.
    let first_index = _.findIndex(arr, char => char === start);
    let last_index  = _.findLastIndex(arr, char => char === end);

    // If we weren't able to find either delimiter, we want to return undefined.
    if ( first_index === -1 || last_index === -1 ) return undefined;

    // If the two delimiters are the same, and we were only able to find a
    // single occurance, we want to return undefined.
    if ( start === end && first_index === last_index ) return undefined;

    return arr.slice(first_index+1, last_index).join('');
  },

};
