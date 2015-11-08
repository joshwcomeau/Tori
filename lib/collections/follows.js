Follows = new Mongo.Collection('follows');

Follows.before.insert( function(userId, doc) {
  // Denormalization!
  // Increment the 'following' count for the current user, and the 'followers'
  // count of the being-followed user
  Meteor.users.update(doc.fromUserId, { $inc: { following: 1 } });
  Meteor.users.update(doc.toUserId,   { $inc: { followers: 1 } });
});