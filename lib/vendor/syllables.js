/*
  Original Source:
    Plucked from spencermountain's `nlp_compromise`.
    https://github.com/spencermountain/nlp_compromise
  Modified by:
    Joshua Comeau, for use in Tori
    https://github.com/joshwcomeau/Tori
*/

//chop a string into pronounced syllables
ParseSyllables = function (str) {
  var all = []

  // Remove any end-of-word punctuation. Replace it after the count
  var punctuation_regex = /[!?\.]+$/g;
  var punctuation = null;

  if ( punctuation_regex.test(str) ) {
    var punctuation = str.match(punctuation_regex)[0];
    str = str.replace(punctuation_regex, '');
  }

  // Manual overrides
  // There are a lot of words that this syllable counter doesn't do great at.
  // Stored in a local file in the same directory.
  // TODO: Whittle this list down from 8k X_X
  var exception = SyllableExceptions[ str.toLowerCase() ]
  if ( exception ) {
    // Create a local working copy, so we don't modify the Exception itself!
    var syllables = exception.slice();
    if ( punctuation ) { syllables[syllables.length-1] += punctuation; }
    return syllables;
  }

  //suffix fixes
  var postprocess = function (arr) {
    //trim whitespace
    arr = arr.map(function (w) {
      w = w.replace(/^ */, '')
      w = w.replace(/ *$/, '')
      return w
    })
    if (arr.length > 2) {
      return arr
    }
    var ones = [
      /^[^aeiou]?ion/i,
      /^[^aeiou]?ised/i,
      /^[^aeiou]?iled/i
    ]
    var l = arr.length
    if (l > 1) {
      var suffix = arr[l - 2] + arr[l - 1];
      for (var i = 0; i < ones.length; i++) {
        if (suffix.match(ones[i])) {
          arr[l - 2] = arr[l - 2] + arr[l - 1];
          arr.pop();
        }
      }
    }
    return arr
  }

  var doer = function (str, previous) {
    var vow = /[aeiouy]$/i
    if (!str) {
      return
    }
    var chars = str.split('')
    var before = "";
    var after = "";
    var current = "";
    for (var i = 0; i < chars.length; i++) {
      before = chars.slice(0, i).join('')
      current = chars[i]
      after = chars.slice(i + 1, chars.length).join('')
      var candidate = before + chars[i]

      //rules for syllables-

      //it's a consonant that comes after a vowel
      if (before.match(vow) && !current.match(vow)) {

        // If it's an 'ed' at the very end of the string
        if ( str === 'ed' && (!after) ) {
          // If the character before it is NOT a T
          if ( previous !== 't' ) {
            all[all.length - 1] = (all[all.length - 1] || '') + str; //append it to the last one
            return doer(after, current);
          }
        }

        if (after.match(/^e[sm]/i)) {
          candidate += "e"
          after = after.replace(/^e/, '')
        }
        all.push(candidate)
        return doer(after, current)
      }
      //unblended vowels ('noisy' vowel combinations)
      if (candidate.match(/(eo|eu|ia|oa|ua|ui)$/i)) { //'io' is noisy, not in 'ion'
        all.push(before)
        all.push(current)
        return doer(after, current)
      }
    }
    //if still running, end last syllable
    if (str.match(/[aiouy]/i) || str.match(/ee$/i)) { //allow silent trailing e
      all.push(str)
    } else {
      all[all.length - 1] = (all[all.length - 1] || '') + str; //append it to the last one
    }
  }

  str.split(/\s\-/i).forEach(function (s) {
    doer(s)
  })
  all = postprocess(all)

  //for words like 'tree' and 'free'
  if (all.length === 0) {
    all = [str]
  }

  // If we removed any punctuation pre-test, append it back now.
  if ( punctuation ) {
    all[all.length-1] += punctuation;
  }

  return all
};

if ( typeof module !== 'undefined' )
  module.exports = ParseSyllables;
