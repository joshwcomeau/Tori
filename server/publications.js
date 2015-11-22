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
  // This method returns the most recent Haikus written or shared by a given
  // user. This is a surprisingly complex process, because we want them ordered
  // by when the GIVEN USER posted or shared them.
  //
  // Let's say at 2PM Tom posts a Haiku about flowers. At 4PM he's browsing the
  // site and he Shares a Haiku written by Sharon last week. If we just order
  // the Haikus by their `createdAt` date, Tom's flower post will show up ahead
  // of Sharon's, even though he shared it 2 hours later.
  //
  // To get around this problem, all Haikus have an associated Event.
  // Shared haikus have a 'share' event, and original Haikus have a 'haiku' one.
  // By using that as our primary source of truth, and fetching their haikus
  // as dependencies, we can assure that we have the right data in the right
  // order, even with pagination (we limit to the newest 10 events, not haikus)
  //
  // There is a problem with this approach, however. It means that we can't
  // easily send down a Haiku's own Event data (whether the current user has
  // liked or shared one of the Haikus on this page). While there might be some
  // crazy theoretical way to accomplish all this in one publication, for my
  // own sanity, I've split it up. Here's the flow:
  //
  //    1) We find the N most recent post-related Events (haiku or share)
  //    2) We fetch the associated Haikus, and their respective authors.
  //    3) We send these Events, Haikus and Users down to the client.
  //    4) The client figures out which haikuIds it needs `like`/`share` Event
  //       info for, makes a request to `myInteractionsWithHaikus` publication.
  //    5) In that other publication, the server returns all the events needed.


  if (profile_name) profile_name = profile_name.toLowerCase();
  let user = Meteor.users.findOne({ username: profile_name });
  if ( !user ) return false;

  // Find all Events of the right type by the user we're visiting.
  let eventQuery = {
    eventType:  { $in: ['haiku', 'share'] },
    userId:     user._id
  };

  this.addDependency('events', 'haikuId', function(event) {
    // Find the Haiku associated with this event.
    return Haikus.find(event.haikuId);
  });

  this.addDependency('events', 'haikuAuthorId', function(event) {
    // Share the author of this Haiku! It isn't necessarily the same as the
    // user whose page we're visiting, if that user has Shared another user's
    // Haiku.
    return Meteor.users.find(event.haikuAuthorId, { fields: {
      profile: 1,
      username: 1
    } });
  });

  return [
    Events.find(eventQuery, { sort: { createdAt: -1 }, limit: limit })
  ];

});


Meteor.publish('myInteractionsWithHaikus', function(haikuIds) {
  // Ignore bogus requests
  if ( _.isEmpty(haikuIds) ) return;

  // Make sure haikuIds is always an array
  if ( !_.isArray(haikuIds) ) haikuIds = [haikuIds];

  return Events.find({
    eventType:  { $in: ['like', 'share'] },
    haikuId:    { $in: haikuIds },
    userId:     this.userId
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
