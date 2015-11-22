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

Meteor.smartPublish('activeProfileHaikus', function(profile_name, limit = 20) {
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

  let user = UserUtils.findUserByProfileName(profile_name);
  if ( !user ) return false;

  // Find all Events of the right type by the user we're visiting.
  let eventQuery = {
    eventType:  { $in: ['haiku', 'share'] },
    userId:     user._id
  };
  let eventOptions = { sort: { createdAt: -1 }, limit: limit };


  addHaikuDependencyToEvents.call(this);
  addAuthorDependencyToEvents.call(this);

  return [
    Events.find(eventQuery, eventOptions)
  ];

});

Meteor.smartPublish('homeFeedHaikus', function(limit = 5) {
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
  addAuthorDependencyToEvents.call(this);

  return [
    Events.find(eventQuery, eventOptions)
  ];

});

Meteor.smartPublish('popularHaikus', function(limit = 5) {
  check(limit, Number);

  // Because we don't have the same who-shared-when concerns as with the other
  // Haiku-getting methods, I don't need to fetch Events first.
  // Instead, I can just find the top N Haikus, and fetch them with their
  // authors.
  let haikuQuery    = {};
  let haikuOptions  = { sort: { likeCount: -1}, limit: limit };

  addAuthorDependencyToHaikus.call(this);

  return [ Haikus.find(haikuQuery, haikuOptions) ];

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
  addAuthorDependencyToHaikus.call(this);

  // Get the users responsible for all likes/shares
  this.addDependency('events', 'userId', function(event) {
    return Meteor.users.find(event.userId, { fields: {
      profile: 1,
      username: 1
    } });
  });



  return [
    Haikus.find( haikuId ),
    Events.find({
      eventType: { $in: ['like', 'share', 'reply'] },
      haikuId: haikuId
    })
  ];
});




// HELPERS
function addAuthorDependencyToEvents() {
  this.addDependency('events', 'haikuAuthorId', function(event) {
    // Share the author of this Haiku! It isn't necessarily the same as the
    // user whose page we're visiting, if that user has Shared another user's
    // Haiku.
    return Meteor.users.find(event.haikuAuthorId, { fields: {
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

function addAuthorDependencyToHaikus() {
  this.addDependency('haikus', 'userId', function(haiku) {
    return Meteor.users.find(haiku.userId, { fields: {
      profile: 1, username: 1
    }});
  });
}
