Template.bestHaikus.onCreated(function() {
  this.autorun( () => {
    this.subscribe('bestHaikus');
  });
});

Template.bestHaikus.helpers({
  haikus: () => Haikus.find({}, { sort: { likeCount: -1 } })
});
