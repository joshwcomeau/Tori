Meteor.publish('activeProfile', function(profile_name) {
  return Meteor.users.find({ username: profile_name });
});

Meteor.publish('activeProfileHaikus', function(profile_name) {
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
  return Likes.find({
    haikuId: haiku_id,
    fromUserId: this.userId
  });
});