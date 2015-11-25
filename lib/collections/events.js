Events = new Mongo.Collection('events');
Events.attachSchema( new SimpleSchema({
  eventType: {
    type: String,
    allowedValues: ['like', 'share', 'reply', 'haiku']
  },

  haikuId:        { type: String },

  // This is the user creating the Event. The person sharing/liking/posting
  userId:         { type: String },

  // This is the original author of the haikuId.
  // With 'haiku'-type events, this is the same value as userId.
  haikuAuthorId:  { type: String },

  // Timestamps
  createdAt:      SchemaHelpers.createdAt,
  updatedAt:      SchemaHelpers.updatedAt

}));


Events.before.insert( function(userId, doc) {
  // Update the Haiku's like/share count, if relevant.
  let update_object = {};
  switch ( doc.eventType ) {
    case 'like':
      update_object = { $inc:   { likeCount:  1 } };
      break;
    case 'share':
      update_object = { $inc:   { shareCount:  1 } };
      break;
  }

  Haikus.update( doc.haikuId, update_object );
});


Events.after.insert( function(userId, doc) {
  // Create a notification for the haiku author
  Notifications.insert({
    sourceCollection: 'Events',
    notificationType: doc.eventType,
    fromUserId:       doc.userId,
    toUserId:         doc.haikuAuthorId,
    haikuId:          doc.haikuId
  });
});

Events.before.remove( function(userId, doc) {
  switch ( doc.eventType ) {
    case 'like':
      update_object = { $inc:   { likeCount: -1 } };
      break;
    case 'share':
      update_object = { $inc:   { shareCount: -1 } };
      break;
  }

  Haikus.update( doc.haikuId, update_object );
});


Meteor.methods({
  toggleEvent: function(haikuId, eventType) {
    // This works for 'like' and 'share' haiku events, since those can be
    // toggled from the haikuFooter template.

    if ( !this.userId ) {
      throw new Meteor.Error(401, "You must be logged in to like a Haiku!");
    }

    let haiku = Haikus.findOne(haikuId);

    // IF this event already exists, we're toggling it off
    let identifying_attrs = {
      haikuId:        haikuId,
      userId:         this.userId,
      haikuAuthorId:  haiku.userId,
      eventType:      eventType
    };

    if ( Events.findOne( identifying_attrs ) ) {
      return Events.remove(identifying_attrs);
    }

    if ( !haiku ) {
      throw new Meteor.Error(404, "haiku-not-found", `You tried to ${eventType} a Haiku that does not exist. Maybe it got deleted?`);
    }

    if ( eventType === 'share' && this.userId === haiku.userId ) {
      throw new Meteor.Error(400, "cannot-share-self", `You're not allowed to Share a post you've written! Stop that.`);
    }

    Events.insert(identifying_attrs);
  }
});
