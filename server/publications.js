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

  let query   = { userId: user_id }
  let options = { sort: { createdAt: -1} }

  getHaikusWithAuthors(this, query, options);
});


Meteor.publish('myLikesForHaiku', function(haiku_id) {
  return Events.find({
    type: 'like',
    haikuId: haiku_id,
    "from.userId": this.userId
  });
});

Meteor.publish('activeHaiku', function(haiku_id) {
  let query = {
    $or: [
      { _id:          haiku_id },
      { shareOfId:    haiku_id },
      { inReplyToId:  haiku_id }
    ]
  };
  let options = { sort: { createdAt: -1} }

  getHaikusWithAuthors(this, query, options);

  return [
    Events.find({ haikuId: haiku_id })
  ];
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



// HELPERS
function publishAssociatedUser(userId, handles) {
  let userCursor = Meteor.users.find({_id: userId });
  handles[userId] = Mongo.Collection._publishCursor(userCursor, sub, 'users');
}

function getEventsWithUsers(haikuId) {
  // Takes a cursor for events, and finds event users
  let query   = { haikuId: haikuId };
  let options = { sort: { createdAt: -1} };

  let userHandles = {};

  let eventsHandle = Events.find(query, options).observeChanges({
    added: function(id, event) {
      publishAssociatedUser(event.fromUserId, userHandles);
      sub.added('events', id, event);
    },
    changed: function(id, fields) {
      sub.changed('events', id, fields);
    },
    removed: function(id) {
      if ( )
    }
  });
}

function getHaikusWithAuthors(sub, query, options) {


  let userHandles = {};

  let haikuHandle = Haikus.find(query, options).observeChanges({
    added: function(id, haiku) {
      // In addition to publishing this new Haiku, we need to fetch and
      // publish its author!
      publishAssociatedUser(haiku.userId, userHandles);

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
