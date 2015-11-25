Meteor.publish('activeProfile', function(profileName) {
  // Return the active profile, and whether or not the current user is
  // following him/her
  if (profileName) profileName = profileName.toLowerCase();

  let publications = [Meteor.users.find({ username: profileName })]

  if ( this.userId ) {
    let user_profile = Meteor.users.findOne({ username: profileName });
    if ( user_profile ) {
      publications.push( Follows.find({
        fromUserId: this.userId,
        toUserId: user_profile._id
      }) );
    }
  }

  return publications;
});

Meteor.smartPublish('activeProfileHaikus', function(profileName, limit = 4) {
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
  check(limit, Number);

  let user = UserUtils.findUserByProfileName(profileName);
  if ( !user ) return false;

  // Find all Events of the right type by the user we're visiting.
  let eventQuery = {
    eventType:  { $in: ['haiku', 'share'] },
    userId:     user._id
  };
  let eventOptions = { sort: { createdAt: -1 }, limit: limit };


  addHaikuDependencyToEvents.call(this);
  addUserDependencyToCollection.call(this, 'haikuAuthorId', 'events');

  return [
    Events.find(eventQuery, eventOptions)
  ];

});

Meteor.smartPublish('homeFeedHaikus', function(limit = 4) {
  check(limit, Number);
  // Must be logged in for this to make any sense.
  if ( !this.userId ) return;

  // Essentially, this is the same as looking at a given user's profile page,
  // except instead of just 1 user, it's all the users we're following. We'll
  // also include our own Haikus as well.

  // Get an array of all the userIds we're following.
  let userIds = Follows.find({ fromUserId: this.userId }).map(
    follow => follow.toUserId
  );

  // Include our own stuff
  userIds.push( this.userId );

  // Find all Events of the right type by the given users.
  let eventQuery = {
    eventType:  { $in: ['haiku', 'share'] },
    userId:     { $in: userIds }
  };
  let eventOptions = { sort: { createdAt: -1 }, limit: limit };

  addHaikuDependencyToEvents.call(this);
  addUserDependencyToCollection.call(this, 'haikuAuthorId', 'events');

  return [
    Events.find(eventQuery, eventOptions)
  ];

});

Meteor.smartPublish('popularHaikus', function(limit = 4) {
  check(limit, Number);

  // Because we don't have the same who-shared-when concerns as with the other
  // Haiku-getting methods, I don't need to fetch Events first.
  // Instead, I can just find the top N Haikus, and fetch them with their
  // authors.
  let haikuQuery    = {};
  let haikuOptions  = { sort: { likeCount: -1}, limit: limit };

  addUserDependencyToCollection.call(this, 'userId', 'haikus');

  // Let's also send along my interactions with these top posts.
  this.addDependency('haikus', '_id', function(haiku) {
    return Events.find({
      eventType: { $in: ['like', 'share', 'reply'] },
      haikuId: haiku._id
    })
  });

  return [ Haikus.find(haikuQuery, haikuOptions) ];

});

Meteor.smartPublish('myNotifications', function() {
  let notificationQuery = {
    seen: false,
    toUserId: this.userId
  };
  let notificationOptions = {
    sort: { createdAt: -1 },
    limit: 10
  };

  // Send some user info about the people these notifications are from
  addUserDependencyToCollection.call(this, 'fromUserId', 'notifications');

  return [
    Notifications.find(notificationQuery, notificationOptions)
  ];
});


Meteor.publish('myInteractionsWithHaikus', function(haikuIds) {
  check(haikuIds, [String]);

  return Events.find({
    eventType:  { $in: ['like', 'share'] },
    haikuId:    { $in: haikuIds },
    userId:     this.userId
  });
});

Meteor.smartPublish('activeHaiku', function(haikuId) {
  check(haikuId, String);

  // TODO: Paginate events.

  // Get the Haiku's author
  addUserDependencyToCollection.call(this, 'userId', 'haikus');

  // Get the users responsible for all likes/shares
  addUserDependencyToCollection.call(this, 'userId', 'events');

  return [
    Haikus.find( haikuId ),
    Events.find({
      eventType: { $in: ['like', 'share', 'reply'] },
      haikuId: haikuId
    })
  ];
});

Meteor.smartPublish('activeProfileFollowers', function(profileName, limit = 1) {
  let user = UserUtils.findUserByProfileName(profileName);
  if ( !user ) return false;

  // We need to publish the first LIMIT users following this profile, but also
  // whether the profile user is following them. We need both sides, so we can
  // update the 'follow' button as needed.
  this.addDependency('follows', 'fromUserId', function(follow) {
    return Follows.find({ toUserId: follow.fromUserId, fromUserId: user._id })
  });

  // We also need to grab the user data pertaining to the people following us.\
  // We need slightly more info than usual, which is why I'm not using the
  // helper method `addUserDependencyToCollection`.
  this.addDependency('follows', 'fromUserId', function(follow) {
    return Meteor.users.find(follow.fromUserId, { fields: {
      profile: 1,
      username: 1,
      haikus: 1,
      followers: 1,
      following: 1,
      createdAt: 1
    } });
  });

  return [
    Follows.find({ toUserId: user._id })
  ];

})




// HELPERS
function addUserDependencyToCollection(userField, collection) {
  // addDependency is a method provided by SmartPublish. Whenever an item
  // of collection is published, it runs this dependency function to find
  // any associated users, and returns the correct fields (profile and username).
  this.addDependency(collection, userField, function(event) {
    return Meteor.users.find(event[userField], { fields: {
      profile: 1,
      username: 1
    } });
  });
}


function addHaikuDependencyToEvents() {
  this.addDependency('events', 'haikuId', function(event) {
    // Find the Haiku associated with this event.
    return Haikus.find(event.haikuId);
  });
}
