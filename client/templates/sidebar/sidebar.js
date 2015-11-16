Template.sidebar.onCreated(function() {
  this.autorun( () => {
    this.subscribe('activeProfile', FlowRouter.getParam('profile_name').toLowerCase());
    this.subscribe('followingActiveProfile', FlowRouter.getParam('profile_name').toLowerCase());
  });
});

Template.sidebar.helpers({
  profile: function() {
    var profile_name = FlowRouter.getParam('profile_name').toLowerCase();
    return Meteor.users.findOne({ username: profile_name }) || {};
  },
  isFollowing: function() {
    return UserUtils.isCurrentUserFollowing( FlowRouter.getParam('profile_name').toLowerCase() );
  }
});

Template.sidebar.events({
  "click button": function(ev, instance) {
    Meteor.call('toggleFollowing', FlowRouter.getParam('profile_name').toLowerCase());
  }
});
