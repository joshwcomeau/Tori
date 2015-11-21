Template.bestHaikus.onCreated(function() {
  this.autorun( () => {
    this.subscribe('bestHaikus', FlowRouter.getParam('profile_name'));
  });
});

Template.bestHaikus.helpers({
  haikus: function() {
    profile = UserUtils.findUserByProfileName(
      FlowRouter.getParam('profile_name')
    );

    // Find all Haikus posted OR shared by this user.
    return Haikus.find({ $or: [
      { userId: profile._id },
      { shares: { $in: [profile._id] }}
    ]});
  }
});
