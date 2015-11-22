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
      userId: Meteor.user()._id,
      eventType: 'like'
    });
  },
  shareButtonDisabled: function() {
    // This button will be disabled if:
    //   - You are not logged in, or
    //   - You're the author of the Haiku in question
    return !Meteor.user() || Meteor.userId() === this.userId;
  },
  shareButtonClass: function() {
    if ( !Meteor.user() ) return 'not-shared';

    let preExistingShare = Events.findOne({
      haikuId: this._id,
      userId: Meteor.user()._id,
      eventType: 'share'
    });

    return preExistingShare ? 'shared' : 'not-shared';
  },
  likeButtonDisabled: function() {
    return !Meteor.user();
  },
  likeButtonClass: function() {
    if ( !Meteor.user() ) return 'not-liked';

    let preExistingLike = Events.findOne({
      haikuId: this._id,
      userId: Meteor.user()._id,
      eventType: 'like'
    });

    return preExistingLike ? 'liked' : 'not-liked';
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
    return this.shareCount > 0 ? this.shareCount : '';
  },
  humanizedLikes: function() {
    // TODO: Util that makes the numbers nicer. '3.2k' instead of '3278'.
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
