Haikus = new Mongo.Collection('haikus');

Haikus.before.insert( function(userId, doc) {
  Meteor.users.update( doc.userId, { $inc: { haikus: 1 } } );
});

Haikus.before.remove( function(userId, doc) {
  Meteor.users.update( doc.userId, { $inc: { haikus: -1 } } );
});

Meteor.methods({
  postHaiku: function(attributes) {
    check(attributes, {
      line1: String,
      line2: String,
      line3: String,
      backgroundImage: Match.Optional(String)
    });
    
    if ( !this.userId ) {
      throw new Meteor.Error(401, "You must be logged in to post a Haiku!");
    }
    
    attributes.userId = this.userId;
    attributes.createdAt = moment().toISOString();
    
    Haikus.insert(attributes);
    
  }
});