Template.profileHaikus.onCreated(function() {
  this.autorun( () => this.subscribe('activeProfileHaikus', FlowRouter.getParam('profile_name')) );
});

Template.profileHaikus.helpers({
  haikus: function() {
    profile = UserUtils.findUserByProfileName( FlowRouter.getParam('profile_name') );
    
    return Haikus.find({
      userId: profile._id
    });
  }

})