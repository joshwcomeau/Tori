Template.profileStats.onCreated(function() {
  this.autorun( () => this.subscribe('activeProfile', FlowRouter.getParam('profile_name')) );
});

Template.profileStats.helpers({
  profile: function() {
    return Util.findUserByProfileName( FlowRouter.getParam('profile_name') );
  }
});