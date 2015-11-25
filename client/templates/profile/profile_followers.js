Template.profileFollowers.onCreated(function() {
  let instance = this;
  let profileName = FlowRouter.getParam('profile_name');


  instance.autorun(() => {
    instance.subscribe('activeProfileFollowers', profileName);
  })
});

Template.profileFollowers.helpers({
  followers: (ev, instance) => {
    let profileName = FlowRouter.getParam('profile_name');
    let user = UserUtils.findUserByProfileName(profileName);
    if ( !user ) return;

    return Follows.find({ toUserId: user._id }, { sort: { createdAt: -1 } });
  },
  followerUser: (ev, instance) => {
    let follow = Blaze.getData();
    return Meteor.users.findOne(follow.fromUserId);
  }
})
