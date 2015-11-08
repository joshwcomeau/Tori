Template.profile.onCreated(function() {
  this.autorun( () => this.subscribe('activeProfile', FlowRouter.getParam('profile_name')) );
});

Template.profile.helpers({
  profile: function() {
    var profile_name = FlowRouter.getParam('profile_name');
    var profile = Meteor.users.findOne({ username: profile_name }) || {};
    console.log("Found user", profile)
    return profile;
  }
});