Events = new Mongo.Collection('events');

Events.before.insert( function(userId, doc) {
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

    if ( !Haikus.findOne(haiku_id) ) {
      throw new Meteor.error(404, "haiku-not-found", "You tried to like a Haiku that does not exist. Maybe it got deleted?");
    }

    let attributes = {
      haikuId: haiku_id,
      fromUserId: this.userId
    }

    // Either create or destroy the Like based on whether it exists or not.
    Events.findOne(attributes) ? Events.remove(attributes) : Events.insert(attributes);
  }
});
