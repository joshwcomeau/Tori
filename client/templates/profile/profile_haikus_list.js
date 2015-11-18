Template.profileHaikusList.onCreated(function() {
  this.autorun( () => {
    this.subscribe('activeProfile', FlowRouter.getParam('profile_name'));
    this.subscribe('activeProfileHaikus', FlowRouter.getParam('profile_name'));
  });
});

Template.profileHaikusList.helpers({
  authorUsername: () => FlowRouter.getParam('profile_name'),

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
