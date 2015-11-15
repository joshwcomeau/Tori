Template.haikuFooter.onCreated(function() {
  this.autorun( () => {
    let haiku_id = this.data._id;
    this.subscribe('myLikesForHaiku', haiku_id);
  });
});

Template.haikuFooter.helpers({
  doesLike: function() {
    return Likes.findOne({ haikuId: this._id })
  },
  portraitAttr: function() {
    return {
      class: "portrait",
      style: `background-image: url('${this.author.photo}')`
    };
  },
  authorLinkAttr: function() {
    return {
      class: 'author-name',
      href: `/${this.author.username}`
    }
  },
  relativeDate: function() {
    return moment(this.createdAt).fromNow();
  }
});

Template.haikuFooter.events({
  'click .like': function(ev, instance) {
    let haiku_id = instance.data._id;
    Meteor.call('toggleLike', haiku_id);
  }
});
