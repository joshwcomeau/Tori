Haikus = new Mongo.Collection('haikus');

Haikus.attachSchema( new SimpleSchema({
  // The haiku text itself. Stripped HTML (<br> separating lines).
  body: { type: String },

  // Properties affecting the visual aesthetics of the Haiku
  textColor: {
    type:           String,
    allowedValues:  ['white', 'black'],
    defaultValue:   'black'
  },
  textAlign: {
    type:           String,
    allowedValues:  ['left', 'center', 'right'],
    defaultValue:   'center'
  },
  textValign: {
    type:           String,
    allowedValues:  ['top', 'center', 'bottom'],
    defaultValue:   'center'
  },
  backgroundAlign: {
    type:           String,
    allowedValues:  ['left', 'center', 'right'],
    defaultValue:   'center'
  },
  backgroundValign: {
    type:           String,
    allowedValues:  ['top', 'center', 'bottom'],
    defaultValue:   'center'
  },
  backgroundImage: {
    type:           String,
    optional:       true
  },
  overlayColor: {
    type:           String,
    allowedValues:  ['white', 'black'],
    defaultValue:   'white'
  },
  overlayDirection: {
    type:           String,
    allowedValues:  ['top', 'left', 'center', 'right', 'bottom'],
    defaultValue:   'center'
  },
  showBackground: {
    type: Boolean,
    defaultValue: false
  },
  showOverlay: {
    type: Boolean,
    defaultValue: false
  },

  // Metrics
  likes:      { type: [String], defaultValue: [] },
  shares:     { type: [String], defaultValue: [] },
  likeCount:  { type: Number, defaultValue: 0 },
  shareCount: { type: Number, defaultValue: 0 },

  // The user posting the Haiku
  userId:    { type: String },

  // Timestamps
  createdAt: SchemaHelpers.createdAt,
  updatedAt: SchemaHelpers.updatedAt
}));


Haikus.before.insert( function(userId, doc) {
  // Denormalized number of Haikus, for the user's profile page.
  Meteor.users.update( doc.userId, { $inc: { haikus: 1 } } );
});

Haikus.after.insert( function(userId, doc) {
  // Create an Event indicating that we've posted a new Haiku. This is actually
  // the primary source of truth when generating a list of haikus on a profile.
  // We grab the 25 most recent Events (of type 'haiku' or 'share'), and then
  // fetch the dependent Haiku object.
  //
  // For more information, see publications.js
  Events.insert({
    userId:         doc.userId,
    haikuAuthorId:  doc.userId,
    haikuId:        doc._id,
    eventType:      'haiku'
  });
});

Haikus.before.remove( function(userId, doc) {
  Meteor.users.update( doc.userId, { $inc: { haikus: -1 } } );
  Events.remove({
    userId:         doc.userId,
    haikuAuthorId:  doc.userId,
    haikuId:        doc._id,
    eventType:      'haiku'
  });
});

Meteor.methods({
  publishHaiku: function(haiku) {
    check(haiku, Object);

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

    haiku.userId    = this.userId;

    Haikus.insert(haiku);

    return true;
  }
});
