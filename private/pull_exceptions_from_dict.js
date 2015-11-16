// Simple utility that imports a text file of words and checks a syllable
// validate against them. Returns an object containing all the words it
// _failed_, for use as an 'exceptions' library.

fs                  = require('fs');
validate            = require('../lib/vendor/syllables.js');

var dict_path       = __dirname + '/syllables.txt';

// input markers
var delimiter       = '|';
var assigner        = '=';

var exception_count = 0;
var exceptions      = {};

var common_words = [
  'the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for',
  'on', 'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from',
  'body', 'music', 'color', 'stand', 'sun', 'question', 'fish',
  'area', 'mark', 'dog', 'horse', 'birds', 'problem', 'complete', 'room', 'knew', 'since',
  'ever', 'piece', 'told', 'usually', 'friends', 'easy', 'heard', 'words', 'order', 'red',
  'door', 'sure become', 'top', 'ship', 'across', 'today', 'during', 'short', 'better',
  'best', 'however', 'low', 'hours', 'black', 'products', 'happened', 'whole', 'measure',
  'remember', 'early', 'waves', 'reached', 'words', 'listen', 'wind', 'rock', 'space',
  'covered', 'fast', 'several', 'hold', 'himself', 'toward', 'five', 'step', 'morning',
  'passed', 'vowel', 'true', 'hundred', 'against', 'pattern', 'numeral', 'table', 'north',
  'slowly', 'money', 'map', 'Words', 'farm', 'pulled', 'draw', 'voice', 'seen', 'cold',
  'cried', 'plan', 'notice', 'south', 'sing', 'war', 'ground', 'fall', 'king',
  'town', 'I’ll', 'unit', 'figure', 'certain', 'field', 'travel', 'wood', 'fire',
  'upon', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so',
  'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two',
  'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people', 'my', 'than',
  'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down',
  'day', 'did', 'get', 'come', 'made', 'may', 'part'
];
var common_count    = 0;
var common_wrong = [];

var words, word_count, dict_line, word, syllables, validated_word;

wordList = fs.readFile(dict_path, 'utf-8', function(err, data) {
  // Formatted as:
  //   syllables=syl-la-bles\n
  words = data.replace(/\r/g, '').split('\n');
  word_count = words.length;

  words.forEach( function(wordLine) {
    // Ignore empty lines
    if ( !wordLine ) return;

    dict_line = wordLine.split(assigner);

    // Get the word on its own, for testing
    word = dict_line[0];

    // Get an array of syllables, eg. ['syl', 'la', 'bles']
    syllables = dict_line[1];
    syllables_array = syllables.split(delimiter)

    // Check if our validate comes up with the same solution
    validated_word = validate(word);

    if ( validate(word).length != syllables_array.length ) {
      exception_count++;
      exceptions[word] = syllables_array;

      // Not all words are equally important; shorter, more common words matter most.

      if ( common_words.indexOf(word) != -1 ) {
        common_count++;
        common_wrong.push(word);
      }
    }
  });

  console.log("Out of", word_count, "words, our algorithm got", exception_count, "wrong.");
  console.log("Out of", common_words.length, "COMMON words, we got", common_count, "wrong");

  // fs.writeFileSync('exceptions.json', JSON.stringify(exceptions) );

  return exceptions;

});
