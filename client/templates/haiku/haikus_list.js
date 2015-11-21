Template.haikusList.helpers({
  // CALLED WITH `haiku` CONTEXT.
  haikuAuthor: function() { return Meteor.users.findOne(this.userId).username }
})
