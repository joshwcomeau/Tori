Follows = new Mongo.Collection('follows');
Follows.attachSchema( new SimpleSchema({
  fromUserId: { type: String },
  toUserId:   { type: String },

  // Timestamps
  createdAt:      SchemaHelpers.createdAt,
  updatedAt:      SchemaHelpers.updatedAt

}));

Follows.before.insert( function(userId, doc) {
  // Denormalization!
  // Increment the 'following' count for the current user, and the 'followers'
  // count of the being-followed user
  Meteor.users.update(doc.fromUserId, { $inc: { following: 1 } });
  Meteor.users.update(doc.toUserId,   { $inc: { followers: 1 } });
});

Follows.after.insert( function(userId, doc) {
  // Create a notification for the user being followed
  Notifications.insert({
    sourceCollection: 'Follows',
    notificationType: 'follow',
    fromUserId:       doc.fromUserId,
    toUserId:         doc.toUserId
  });
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
    profile_name = profile_name.toLowerCase();

    check(profile_name, String);

    if ( !this.userId ) {
      throw new Meteor.Error(401, "You must be logged in to follow someone!");
    }

    let user = UserUtils.findUserByProfileName(profile_name);

    if ( !user ) {
      throw new Meteor.Error(404, "user-not-found", "You tried to follow a user that does not exist.");
    }

    if ( this.userId === user._id ) {
      throw new Meteor.Error(409, "You're not allowed to follow yourself, narcissist!")
    }

    let attributes = {
      fromUserId: this.userId,
      toUserId: user._id
    };

    Follows.findOne(attributes) ? Follows.remove(attributes) : Follows.insert(attributes);
  }
});
