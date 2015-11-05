Meteor.publish('activeProfile', function(profile_name) {
  return Profiles.find({ username: profile_name });
})