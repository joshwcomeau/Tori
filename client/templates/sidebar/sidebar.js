Template.sidebar.onCreated(function() {
  this.autorun( () => {
    var profile_name = FlowRouter.getParam('profile_name');
    this.subscribe('activeProfile', profile_name);
  });
});

Template.sidebar.helpers({
  user: function() {
    var profile_name = FlowRouter.getParam('profile_name');
    var profile = Meteor.users.findOne({ username: profile_name }) || {};
    console.log(profile)
    return profile;
  }
});