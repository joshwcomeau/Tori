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
  // TODO: Combine this into activeProfile?
  if (profile_name) profile_name = profile_name.toLowerCase();

  let user_id = Meteor.users.findOne({ username: profile_name })._id;
  return Haikus.find({ userId: user_id });
});

Meteor.publish('myLikesForHaiku', function(haiku_id) {
  return Events.find({
    type: 'like',
    haikuId: haiku_id,
    "from.userId": this.userId
  });
});

Meteor.publish('activeHaiku', function(haiku_id) {
  return [
    Haikus.find({
      $or: [
        { _id:          haiku_id },
        { shareOfId:    haiku_id },
        { inReplyToId:  haiku_id }
      ]
    }),
    Events.find({ haikuId: haiku_id })
  ];
});

Meteor.publish('homeFeed', function() {
  // Find all Haikus from people we are following
  let followedByUserCursor = Follows.find({ fromUserId: this.userId });
  let authorIds = followedByUserCursor.map( follow => follow.toUserId );
  let haikuCursor = Haikus.find({ userId: { $in: authorIds } });

  return followedByUserCursor, haikuCursor;
})
