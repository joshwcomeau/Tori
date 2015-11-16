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

    // IF we've already liked it, we're toggling it off.
    let identifying_attrs = { haikuId: haiku_id, "from.userId": this.userId }
    if ( Events.findOne( identifying_attrs ) ) {
      return Events.remove(identifying_attrs);
    }

    let haiku = Haikus.findOne(haiku_id);

    if ( !haiku ) {
      throw new Meteor.error(404, "haiku-not-found", "You tried to like a Haiku that does not exist. Maybe it got deleted?");
    }

    let attributes = {
      type: 'like',
      haikuId: haiku_id,
      to: {
        userId: haiku.userId,
        displayName: haiku.author.displayName,
        username: haiku.author.username
      },
      from: {
        userId: this.userId,
        displayName: Meteor.user().profile.displayName,
        username: Meteor.user().username,
      }
    }

    return Events.insert(attributes);
  }
});
