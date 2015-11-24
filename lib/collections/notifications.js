Notifications = new Mongo.Collection('notifications');
Notifications.attachSchema( new SimpleSchema({
  sourceCollection: {
    type: String,
    allowedValues: ['Events', 'Follows']
  },
  notificationType: {
    type: String,
    allowedValues: ['like', 'share', 'reply', 'follow']
  },

  fromUserId:     { type: String },
  toUserId:       { type: String },

  haikuId:        { type: String, optional: true },
  seen:           { type: Boolean, defaultValue: false},

  // Timestamps
  createdAt:      SchemaHelpers.createdAt,
  updatedAt:      SchemaHelpers.updatedAt

}));

Meteor.methods({
  markAsSeen: function(notificationId) {
    check(notificationId, String);

    Notifications.update(notificationId, { $set: { seen: true } });
  }
});
