Haikus = new Mongo.Collection('haikus');

Haikus.before.insert( function(userId, doc) {
  Meteor.users.update( doc.userId, { $inc: { haikus: 1 } } );
});

Haikus.before.remove( function(userId, doc) {
  Meteor.users.update( doc.userId, { $inc: { haikus: -1 } } );
});