Meteor.publish('activeProfile', function(profile_name) {
  // Return the active profile, and whether or not the current user is
  // following it
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

Meteor.publish('activeProfileHaikus', function(profile_name) {
  if (profile_name) profile_name = profile_name.toLowerCase();
  let user_id = Meteor.users.findOne({ username: profile_name })._id;

  let query   = { $or: [
    { userId: user_id },
    { shares: { $in: [user_id] }}
  ]};
  let options = { sort: { createdAt: -1} }

  getHaikusWithAuthors(this, query, options);
});

Meteor.publish('activeProfileEvents', function(profile_name) {
  if (profile_name) profile_name = profile_name.toLowerCase();
  let user_id = Meteor.users.findOne({ username: profile_name })._id;

  return Events.find({
    fromUserId: this.userId,
    toUserId: user_id
  });
});


Meteor.publish('myInteractionsWithHaiku', function(haikuId) {
  return Events.find({
    haikuId: haikuId,
    fromUserId: this.userId
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
      // publish its author!
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
