Follows = new Mongo.Collection('follows');

Follows.before.insert( function(userId, doc) {
  // Denormalization!
  // Increment the 'following' count for the current user, and the 'followers'
  // count of the being-followed user
  Meteor.users.update(doc.fromUserId, { $inc: { following: 1 } });
  Meteor.users.update(doc.toUserId,   { $inc: { followers: 1 } });
});

Follows.before.remove( function(userId, doc) {
  // Denormalization!
  // Increment the 'following' count for the current user, and the 'followers'
  // count of the being-followed user
  Meteor.users.update(doc.fromUserId, { $inc: { following: -1 } });
  Meteor.users.update(doc.toUserId,   { $inc: { followers: -1 } });
});

Meteor.methods({
  toggleFollowing: function(profile_name) {
    // TODO: Check to make sure I'm not able to follow myself.
    let user = Util.findUserByProfileName(profile_name);
    let attributes = {
      fromUserId: this.userId,
      toUserId: user._id
    }
    Follows.findOne(attributes) ? Follows.remove(attributes) : Follows.insert(attributes);
  }
});