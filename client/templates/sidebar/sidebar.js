Template.sidebar.onCreated(function() {
  this.autorun( () => {
    this.subscribe('activeProfile', FlowRouter.getParam('profile_name'));
    this.subscribe('followingActiveProfile', FlowRouter.getParam('profile_name'));
  });
});

Template.sidebar.helpers({
  profile: function() {
    var profile_name = FlowRouter.getParam('profile_name');
    return Meteor.users.findOne({ username: profile_name }) || {};
  },
  isFollowing: function() {
    return UserUtils.isCurrentUserFollowing(FlowRouter.getParam('profile_name'));
  }
});

Template.sidebar.events({
  "click button": function(ev, instance) {
    console.log("Instance", instance)
    Meteor.call('toggleFollowing', FlowRouter.getParam('profile_name'));
  }
});
