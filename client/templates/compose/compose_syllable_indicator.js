Template.syllableIndicator.helpers({
  count: function() {
    return calculateLineCount(this.syllables, this.line);
  },
  height: function() {
    let count = calculateLineCount(this.syllables, this.line);
    return (count / this.limit) * 100 + "%";
  },
  lineComplete: function() {
    let count = calculateLineCount(this.syllables, this.line);
    return count === this.limit;
  }
});

function calculateLineCount(syllables, line) {
  if ( !syllables[line] ) return 0;
  return _.flatten(syllables[line]).length;
}
