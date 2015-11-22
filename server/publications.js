Meteor.publish('activeProfile', function(profile_name) {
  // Return the active profile, and whether or not the current user is
  // following him/her
  if (profile_name) profile_name = profile_name.toLowerCase();

  let publications = [Meteor.users.find({ username: profile_name })]

  if ( this.userId ) {
    let user_profile = Meteor.users.findOne({ username: profile_name });
    if ( user_profile ) {
      publications.push( Follows.find({
        fromUserId: this.userId,
        toUserId: user_profile._id
      }) );
    }
  }

  return publications;
});

Meteor.smartPublish('activeProfileHaikus', function(profile_name, limit = 3) {
  if (profile_name) profile_name = profile_name.toLowerCase();
  let user = Meteor.users.findOne({ username: profile_name });
  if ( !user ) return false;

  // The PRIMARY thing we're publishing isn't actually Haikus, it's Events.
  // Every original Haiku, as well as every Share, has its own event.
  // The reason for this is ordering. Let's say Tom retweets Sally's Haiku about
  // sweaters. That post may have been created a week ago, but it should appear
  // at the TOP of Tom's feed, above his own posts from a few days ago.
  // By sorting by the _event_, we make sure the Haikus appear in the right
  // order.

  // In other words, we first fetch the most recent N events that this user
  // has created, and then fetch the event's dependencies (including the haiku,
  // and the)
  let eventQuery = {
    eventType:  { $in: ['haiku', 'share'] },
    userId:     user._id
  };

  // NOTE: We aren't sending down info about whether the current user has
  // liked or shared these Haikus, information that is necessary when
  // displaying them. Because that data is also stored in Events, and we're
  // limiting this publication to the most recent 25 Haiku/Share events by the
  // profile author, there's a conflict of what is possible to send down at
  // one time. Instead, that will be tackled in a separate publication.

  this.addDependency('events', 'haikuId', function(event) {
    // Find the Haiku associated with this event.
    return Haikus.find(event.haikuId);
  });

  this.addDependency('events', 'haikuAuthorId', function(event) {
    // When this user shares the haiku of another user, we need to ensure
    // that we've included that other user's username and profile.
    return Meteor.users.find(event.haikuAuthorId, { fields: {
      profile: 1,
      username: 1
    } });
  });

  return [
    Events.find(eventQuery, { sort: { createdAt: -1 }, limit: limit })
  ];

});


Meteor.publish('myInteractionsWithHaiku', function(haikuId) {
  return Events.find({
    haikuId: haikuId,
    userId: this.userId
  });
});

Meteor.publish('activeHaiku', function(haikuId) {
  let query = {
    $or: [
      { _id:          haikuId },
      { shareOfId:    haikuId },
      { inReplyToId:  haikuId }
    ]
  };
  let options = { sort: { createdAt: -1} }

  getHaikusWithAuthors(this, query, options);
  getEventsWithUsers(this, haikuId);

});

Meteor.publish('homeFeed', function() {
  // Find all Haikus from people we are following
  let followedByUserCursor = Follows.find({ fromUserId: this.userId });
  let authorIds = followedByUserCursor.map( follow => follow.toUserId );

  // Naturally, I'm allowed to see my own haikus as well.
  authorIds.push( this.userId );

  let query   = { userId: { $in: authorIds } }
  let options = { sort: { createdAt: -1} }

  getHaikusWithAuthors(this, query, options);

});

Meteor.publish('popularHaikus', function(limit) {
  check(limit, Number);

  // Find all the top-ranked Haikus.
  let query   = { }
  let options = { sort: { likeCount: -1}, limit: limit }

  getHaikusWithAuthors(this, query, options);

});


// HELPERS
function publishAssociatedUser(userId, handles, sub) {
  let userCursor = Meteor.users.find({_id: userId });
  handles[userId] = Mongo.Collection._publishCursor(userCursor, sub, 'users');
}

function getEventsWithUsers(sub, haikuId) {
  // Takes a cursor for events, and finds event users
  let query   = { haikuId: haikuId };
  let options = { sort: { createdAt: -1} };

  let userHandles = {};

  let eventsHandle = Events.find(query, options).observeChanges({
    added: function(id, event) {
      publishAssociatedUser(event.fromUserId, userHandles, sub);
      sub.added('events', id, event);
    },
    changed: function(id, fields) {
      sub.changed('events', id, fields);
    },
    removed: function(id) {
      if ( userHandles[id] ) userHandles[id].stop();
      sub.removed('events', id);
    }
  });
  sub.ready();

  sub.onStop( () => eventsHandle.stop() );

}

function getHaikusWithAuthors(sub, query, options) {
  let userHandles = {};

  let haikuHandle = Haikus.find(query, options).observeChanges({
    added: function(id, haiku) {
      // In addition to publishing this new Haiku, we need to fetch and
      // publish its author! As well as anyone sharing it.
      publishAssociatedUser(haiku.userId, userHandles, sub);

      sub.added('haikus', id, haiku);
    },
    changed: function(id, fields) {
      sub.changed('haikus', id, fields);
    },
    removed: function(id) {
      if ( userHandles[id] ) userHandles[id].stop();
      sub.removed('haikus', id);
    }
  });

  sub.ready();

  sub.onStop( () => haikuHandle.stop() );
}
