Likes = new Mongo.Collection('likes');

Likes.before.insert( function(userId, doc) {
  Haikus.update( doc.haikuId, { $inc: { likes: 1} } );
});

Likes.before.remove( function(userId, doc) {
  Haikus.update( doc.haikuId, { $inc: { likes: -1} } );
});