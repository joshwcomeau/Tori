Meteor.publish('activeProfile', function(profile_name) {
  return Meteor.users.find({ username: profile_name });
})