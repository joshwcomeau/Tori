Template.haikuFooter.onCreated(function() {
  this.autorun( () => {
    let haiku_id = this.data._id;
    this.subscribe('myInteractionsWithHaiku', haiku_id);
  });
});

Template.haikuFooter.helpers({
  author: function() {
    return Meteor.users.findOne( this.userId );
  },
  footerClasses: function() {
    // If this Haiku has a background image, it'll be styled differently in CSS.
    if ( this.backgroundImage ) {
      return "haiku-has-bg-image";
    } else {
      return "haiku-has-white-bg";
    }
  },
  shareButtonDisabled: function() {
    // This button will be disabled if:
    //   - You are not logged in, or
    //   - You're the author of the Haiku in question
    return !Meteor.user() || Meteor.userId() === this.userId;
  },
  shareButtonClass: function() {
    let preExistingShare = Events.findOne({
      haikuId: this._id,
      userId: Meteor.userId(),
      eventType: 'share'
    });

    return preExistingShare ? 'shared' : 'not-shared';
  },
  likeButtonDisabled: function() {
    return !Meteor.user();
  },
  likeButtonClass: function() {
    let preExistingLike = Events.findOne({
      haikuId: this._id,
      userId: Meteor.userId(),
      eventType: 'like'
    });

    return preExistingLike ? 'liked' : 'not-liked';
  },
  portraitAttrs: function() {
    return {
      class: "portrait",
      style: `background-image: url('${this.profile.photo}')`
    };
  },
  authorLinkAttrs: function() {
    return {
      class: 'author-name',
      href: `/${this.username}`
    }
  },
  isASharedHaiku: function() {
    // When looking at a single Haiku, sharing is irrelevant. Even if I click
    // on a shared haiku, it should take me to the source.
    if ( FlowRouter.getParam('haiku_id') ) return false;

    // Don't show sharing info on the Popular page, either.
    // It's not the 'share' that's popular, it's the original post!
    if ( FlowRouter.getRouteName() === 'popular' ) return false;

    // If I'm on a profile page, the only posts that show up as shared are ones
    // where the PROFILE user has shared some other person's Haiku.
    if ( FlowRouter.getRouteName() === 'profile' ) {
      let userId = UserUtils.findUserByProfileName( FlowRouter.getParam('profile_name') );
      return !!Events.findOne({
        eventType:  'share',
        haikuId:    this._id,
        userId:     userId
      })
    }

    // If I'm looking at my home feed, things are tricky, but it stands to
    // reason that if I have a `share` event for it, it's shared. The exact
    // user we show as the sharER is a bit complex; see `sharedAuthor`.
    return !!Events.findOne({
      eventType:  'share',
      haikuId:    this._id
    });
  },
  sharedAuthor: function() {
    // If we're on a profile page, we know that any Shares on this page were
    // from this person! So we can just return that
    let profileUser = UserUtils.findUserByProfileName( FlowRouter.getParam('profile_name') )

    if ( profileUser ) return profileUser;


    // If we're on our home feed, things are a bit trickier.
    // A Haiku could show up from someone we aren't following, but which was
    // shared by 3 people we are following, and maybe even us too.
    // Which sharedAuthor do we want?
    // Let's assume, despite it not being a perfect solution, that the earliest
    // sharer is the one we need.
    let event = Events.findOne({
      haikuId: this._id,
      eventType: 'share'
    }, {
      sort: { createdAt: -1 },
      limit: 1
    });

    // Presumably now we have a single Share event. We just need to find the
    // user responsible for it.
    return Meteor.users.findOne( event.userId );
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
