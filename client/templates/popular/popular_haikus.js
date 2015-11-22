Template.popularHaikus.onCreated(function() {
  this.limit = new ReactiveVar(3)
  this.autorun( () => {
    this.subscribe('popularHaikus', this.limit.get());
  });
});

Template.popularHaikus.helpers({
  haikus: () => Haikus.find({}, { sort: { likeCount: -1 } }),
});

Template.popularHaikus.events({
  'click .load-more': (ev, instance) => {
    ev.preventDefault();
    instance.limit.set( instance.limit.get() + 3 )
  }
})
