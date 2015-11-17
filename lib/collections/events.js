Events = new Mongo.Collection('events');

Events.before.insert( function(userId, doc) {
  doc.createdAt = moment().toISOString();
  Haikus.update( doc.haikuId, { $inc: { likes: 1} } );
});

Events.before.remove( function(userId, doc) {
  Haikus.update( doc.haikuId, { $inc: { likes: -1} } );
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
      type:       eventType
    }
    if ( Events.findOne( identifying_attrs ) ) {
      if ( eventType === 'share') {
        Haikus.remove({
          userId: this.userId,
          shareOfId: haikuId
        });
      }

      return Events.remove(identifying_attrs);
    }

    let haiku = Haikus.findOne(haikuId);

    if ( !haiku ) {
      throw new Meteor.error(404, "haiku-not-found", `You tried to ${eventType} a Haiku that does not exist. Maybe it got deleted?`);
    }

    let attributes = {
      type: eventType,
      seen: false,
      haikuId: haikuId,
      toUserId: haiku.userId,
      fromUserId: this.userId,
    }

    Events.insert(attributes);

    // For 'share's, we also need to create the Haiku for the user
    if (eventType === 'share') {
      let newHaiku = _.extend(
        _.omit(haiku, '_id'),
        {
          userId: this.userId,
          shareOfId: haikuId
        }
      );

      Haikus.insert(newHaiku);
    }
  }
});
