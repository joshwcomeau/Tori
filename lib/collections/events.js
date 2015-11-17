Events = new Mongo.Collection('events');

Events.before.insert( function(userId, doc) {
  doc.createdAt = moment().toISOString();
  Haikus.update( doc.haikuId, { $inc: { likes: 1} } );
});

Events.before.remove( function(userId, doc) {
  Haikus.update( doc.haikuId, { $inc: { likes: -1} } );
});


Meteor.methods({
  toggleLike: function(haiku_id) {
    check(haiku_id, String);

    if ( !this.userId ) {
      throw new Meteor.Error(401, "You must be logged in to like a Haiku!");
    }

    // IF we've already liked it, we're toggling it off.
    let identifying_attrs = {
      haikuId:    haiku_id,
      fromUserId: this.userId,
      type:       'like'
    }
    if ( Events.findOne( identifying_attrs ) ) {
      return Events.remove(identifying_attrs);
    }

    let haiku = Haikus.findOne(haiku_id);

    if ( !haiku ) {
      throw new Meteor.error(404, "haiku-not-found", "You tried to like a Haiku that does not exist. Maybe it got deleted?");
    }

    let attributes = {
      type: 'like',
      seen: false,
      haikuId: haiku_id,
      toUserId: haiku.userId,
      fromUserId: this.userId,
    }

    return Events.insert(attributes);
  }
});
