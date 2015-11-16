Template.haikuFooter.onCreated(function() {
  this.autorun( () => {
    let haiku_id = this.data._id;
    this.subscribe('myLikesForHaiku', haiku_id);
  });
});

Template.haikuFooter.helpers({
  doesLike: function() {
    return Events.findOne({
      haikuId: this._id,
      type: 'like'
    });
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
  },
  humanizedShares: function() {
    return this.shares > 0 ? this.shares : '';
  },
  humanizedLikes: function() {
    // TODO: Util that makes the numbers nicer. '3.2k' instead of '3278'.
    return this.likes > 0 ? this.likes : '';
  }
});

Template.haikuFooter.events({
  'click .like': function(ev, instance) {
    let haiku_id = instance.data._id;
    Meteor.call('toggleLike', haiku_id);
  }
});
