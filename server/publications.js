Meteor.publish('activeProfile', function(profile_name) {
  return Meteor.users.find({ username: profile_name });
});

Meteor.publish('activeProfileHaikus', function(profile_name) {
  // TODO: Combine this into activeProfile?
  let user_id = Meteor.users.findOne({ username: profile_name })._id;
  return Haikus.find({ userId: user_id });
});

Meteor.publish('followingActiveProfile', function(profile_name) {
  let user_id = Meteor.users.findOne({ username: profile_name })._id;
  return Follows.find({
    fromUserId: this.userId,
    toUserId: user_id
  });
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
