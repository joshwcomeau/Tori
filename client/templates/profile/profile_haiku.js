Template.profileHaiku.onCreated(function() {
  this.autorun( () => {
    let haiku_id = this.data._id;
    this.subscribe('myLikesForHaiku', haiku_id);
  });
});

Template.profileHaiku.helpers({
  doesLike: function(arg1, arg2) {
    return Likes.findOne({ haikuId: this._id })
  }
});

Template.profileHaiku.events({
  'click .like': function(ev, instance) {
    let haiku_id = instance.data._id;
    Meteor.call('toggleLike', haiku_id);
  }
});