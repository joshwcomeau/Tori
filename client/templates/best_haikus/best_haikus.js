Template.bestHaikus.onCreated(function() {
  this.limit = new ReactiveVar(3)
  this.autorun( () => {
    this.subscribe('bestHaikus', this.limit.get());
  });
});

Template.bestHaikus.helpers({
  haikus: () => Haikus.find({}, { sort: { likeCount: -1 } }),
  initialLoad: () => Haikus.find({}).fetch().length

});

Template.bestHaikus.events({
  'click .load-more': (ev, instance) => {
    ev.preventDefault();
    instance.limit.set( instance.limit.get() + 3 )
  }
})
