Events = new Mongo.Collection('events');
Events.attachSchema( new SimpleSchema({
  eventType: {
    type: String,
    allowedValues: ['like', 'share', 'reply', 'haiku']
  },

  haikuId:        { type: String },

  // For like/share/reply events, this boolean keeps track of whether the
  // `haikuAuthorId` user has SEEN this event. Used for a notifications system.
  seen:           { type: Boolean, optional: true },

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
  doc.createdAt = moment().toISOString();

  // Add the user's ID to the corresponding event list ('likes'/'shares'),
  // and increment its 'count' field by 1.
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

    // IF this event already exists, we're toggling it off
    let identifying_attrs = {
      haikuId:    haikuId,
      userId:     this.userId,
      eventType:  eventType
    }
    if ( Events.findOne( identifying_attrs ) ) {
      return Events.remove(identifying_attrs);
    }

    let haiku = Haikus.findOne(haikuId);

    if ( !haiku ) {
      throw new Meteor.error(404, "haiku-not-found", `You tried to ${eventType} a Haiku that does not exist. Maybe it got deleted?`);
    }

    let attributes = _.extend({}, identifying_attrs, {
      seen:           false,
      haikuAuthorId:  haiku.userId
    });

    Events.insert(attributes);
  }
});
