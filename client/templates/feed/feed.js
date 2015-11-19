Template.feed.onCreated( function() {
  this.autorun( () => {
    this.subscribe('homeFeed');
  })
})

Template.feed.helpers({
  haikus: () => Haikus.find({}),
  haikuAuthor: function() {
    console.log('author context', this)
    Meteor.users.find({ _id: this.userId }).username
  }
})
