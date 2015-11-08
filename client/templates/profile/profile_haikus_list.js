Template.profileHaikusList.onCreated(function() {
  this.autorun( () => {
    this.subscribe('activeProfile', FlowRouter.getParam('profile_name'));
    this.subscribe('activeProfileHaikus', FlowRouter.getParam('profile_name'));
  });
});

Template.profileHaikusList.helpers({
  haikus: function() {
    profile = Util.findUserByProfileName( FlowRouter.getParam('profile_name') );
    
    return Haikus.find({
      userId: profile._id
    });
  }

})