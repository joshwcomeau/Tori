Template.haikuFooter.onCreated(function() {
  this.autorun( () => {
    let haiku_id = this.data._id;
    this.subscribe('myInteractionsWithHaiku', haiku_id);
  });
});

Template.haikuFooter.helpers({
  author: function() {
    return Meteor.users.findOne({ _id: this.userId });
  },
  footerClasses: function() {
    // If this HAiku has a background image, it'll be styled differently in CSS.
    if ( !!this.backgroundImage ) {
      return "haiku-has-bg-image";
    } else {
      return "haiku-has-white-bg";
    }
  },
  doesLike: function() {
    if ( !Meteor.user() ) return false;

    return Events.findOne({
      haikuId: this._id,
      fromUserId: Meteor.user()._id,
      eventType: 'like'
    });
  },
  hasShared: function() {
    if ( !Meteor.user() ) return false;

    return Events.findOne({
      haikuId: this._id,
      fromUserId: Meteor.user()._id,
      eventType: 'share'
    })
  },
  portraitAttr: function() {
    return {
      class: "portrait",
      style: `background-image: url('${this.profile.photo}')`
    };
  },
  authorLinkAttr: function() {
    return {
      class: 'author-name',
      href: `/${this.username}`
    }
  },
  isASharedHaiku: function() {
    // It's a shared haiku if:
    //  - We're on a user's profile page and their userId is in the `shares` arr
    return this.username !== FlowRouter.getParam('profile_name');
  },
  relativeDate: function() {
    return moment(this.createdAt).fromNow();
  },
  humanizedShares: function() {
    if ( !this.shares ) return '';
    return this.shareCount > 0 ? this.shareCount : '';
  },
  humanizedLikes: function() {
    // TODO: Util that makes the numbers nicer. '3.2k' instead of '3278'.
    if ( !this.likes ) return '';
    return this.likeCount > 0 ? this.likeCount : '';
  }
});

Template.haikuFooter.events({
  'click .like': function(ev, instance) {
    let haiku_id = instance.data._id;
    Meteor.call('toggleEvent', haiku_id, 'like');
  },
  'click .share': function(ev, instance) {
    let haiku_id = instance.data._id;
    Meteor.call('toggleEvent', haiku_id, 'share');
  }
});
