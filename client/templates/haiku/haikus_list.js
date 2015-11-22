Template.haikusList.helpers({
  initialLoadCompleted: () => Haikus.find().count(),
  // CALLED WITH `haiku` CONTEXT.
  haikuAuthor: function() { return Meteor.users.findOne(this.userId).username }
})
