Template.haikusList.helpers({
  initialLoadCompleted: () => Haikus.find().count(),
  // CALLED WITH `haiku` CONTEXT.
  haikuAuthor: function() {
    let author = Meteor.users.findOne(this.userId);

    // It's possible that the user subscription hasn't been fulfilled yet.
    if ( !author ) return undefined;

    return author.username;
  }
})
