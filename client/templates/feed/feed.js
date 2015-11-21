Template.feed.onCreated( function() {
  this.autorun( () => {
    this.subscribe('homeFeed');
  })
})

Template.feed.helpers({
  haikus: () => Haikus.find({}),
  haikuAuthor: function() {
    return Meteor.users.findOne(this.userId).username
  }
})
