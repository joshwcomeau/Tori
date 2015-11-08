Template.sidebar.onCreated(function() {
  this.autorun( () => this.subscribe('activeProfile', FlowRouter.getParam('profile_name')) );
});

Template.sidebar.helpers({
  user: function() {
    var profile_name = FlowRouter.getParam('profile_name');
    var profile = Meteor.users.findOne({ username: profile_name }) || {};
    return profile;
  }
});