Template.profileHaikusList.onCreated(function() {
  this.autorun( () => {
    this.subscribe('activeProfile', FlowRouter.getParam('profile_name').toLowerCase());
    this.subscribe('activeProfileHaikus', FlowRouter.getParam('profile_name').toLowerCase());
  });
});

Template.profileHaikusList.helpers({
  haikus: function() {
    profile = UserUtils.findUserByProfileName( FlowRouter.getParam('profile_name').toLowerCase() );

    return Haikus.find({
      userId: profile._id
    });
  }

})
