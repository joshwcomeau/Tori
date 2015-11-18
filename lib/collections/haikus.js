Haikus = new Mongo.Collection('haikus');
// TODO: Add Haiku schema.

Haikus.before.insert( function(userId, doc) {
  Meteor.users.update( doc.userId, { $inc: { haikus: 1 } } );
});

Haikus.before.remove( function(userId, doc) {
  Meteor.users.update( doc.userId, { $inc: { haikus: -1 } } );
});

Meteor.methods({
  publishHaiku: function(haiku) {
    let lines = ComposeUtils.buildSyllablesArray(haiku.body);

    // Ensure the haiku consists of 3 lines
    if (lines.length !== 3) {
      throw new Meteor.Error(400, `Your Haiku needs to have exactly 3 lines. You only have ${lines.length} lines.`);
    }

    let syllables = _.flattenDeep(lines);

    // Ensure it consists of 17 syllables
    if (syllables.length !== 17) {
      throw new Meteor.Error(400, `Oh no! Valid Haikus consist of 17 syllables in a 5-7-5 arrangement. You have ${syllables.length} syllables =(`);
    }

    // Ensure logged in
    if ( !this.userId ) {
      throw new Meteor.Error(401, "You must be logged in to post a Haiku!");
    }

    // Append some custom server attributes
    haiku.userId    = this.userId;
    haiku.createdAt = moment().toISOString();

    // Denormalize some author data for convenience
    haiku.author = {
      displayName: Meteor.user().profile.displayName,
      photo: Meteor.user().profile.photo
    }

    Haikus.insert(haiku);

    return true;
  }
});
