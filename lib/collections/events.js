Events = new Mongo.Collection('events');
Events.attachSchema( new SimpleSchema({
  eventType: {
    type: String,
    allowedValues: ['like', 'share', 'reply']
  },
  seen:       { type: Boolean },
  haikuId:    { type: String },
  toUserId:   { type: String },
  fromUserId: { type: String }
}));


Events.before.insert( function(userId, doc) {
  doc.createdAt = moment().toISOString();

  // Add the user's ID to the corresponding event list ('likes'/'shares'),
  // and increment its 'count' field by 1.
  let update_object = {};
  switch ( doc.eventType ) {
    case 'like':
      update_object = {
        $push:  { likes: userId },
        $inc:   { likeCount:  1 }
      };
      break;
    case 'share':
      update_object = {
        $push:  { shares: userId },
        $inc:   { shareCount:  1 }
      };
      break;
  }

  Haikus.update( doc.haikuId, update_object );
});

Events.before.remove( function(userId, doc) {
  switch ( doc.eventType ) {
    case 'like':
      update_object = {
        $pull:  { likes: userId },
        $inc:   { likeCount: -1 }
      };
      break;
    case 'share':
      update_object = {
        $pull:  { shares: userId },
        $inc:   { shareCount: -1 }
      };
      break;
  }

  Haikus.update( doc.haikuId, update_object );
});


Meteor.methods({
  toggleEvent: function(haikuId, eventType) {

    if ( !this.userId ) {
      throw new Meteor.Error(401, "You must be logged in to like a Haiku!");
    }

    // IF this event already exists, we're toggling it off
    let identifying_attrs = {
      haikuId:    haikuId,
      fromUserId: this.userId,
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
      seen: false,
      toUserId: haiku.userId
    });

    Events.insert(attributes);
  }
});
