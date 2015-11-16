Template.profileStats.onCreated(function() {
  this.autorun( () => this.subscribe('activeProfile', FlowRouter.getParam('profile_name').toLowerCase()) );
});

Template.profileStats.helpers({
  profile: function() {
    return UserUtils.findUserByProfileName( FlowRouter.getParam('profile_name').toLowerCase() );
  }
});
