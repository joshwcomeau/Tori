Template.sidebar.onCreated(function() {
  this.autorun( () => {
    this.subscribe('activeProfile', FlowRouter.getParam('profile_name'));
  });
});

Template.sidebar.helpers({
  profile: () => {
    // If we're visiting someone else's profile, we need to fetch their details.
    if ( FlowRouter.getParam('profile_name') ) {
      return UserUtils.findUserByProfileName(FlowRouter.getParam('profile_name'));
    }
    // Otherwise, if we're logged in, show our own
    if ( Meteor.user() ) {
      return Meteor.user();
    }
    // If we're not logged in, we shouldn't be on a page that has a sidebar.
  },
  isFollowing: () => {
    let profileName = FlowRouter.getParam('profile_name');
    if ( profileName && profileName !== Meteor.user().username ) {
      return UserUtils.isCurrentUserFollowing(
        FlowRouter.getParam('profile_name')
      );
    }
  },
  // Show the follow button when we're logged in, and on a profile page.
  showFollowButton: () => Meteor.user() && FlowRouter.getParam('profile_name')

});

Template.sidebar.events({
  "click button": function(ev, instance) {
    Meteor.call('toggleFollowing', FlowRouter.getParam('profile_name').toLowerCase());
  }
});
