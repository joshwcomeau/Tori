Template.profileFollow.onCreated(function() {
});

Template.profileFollow.helpers({
  joinedOn: (ev, instance) => {
    let createdAt = Blaze.getData().createdAt;
    return moment(createdAt).format('MMMM Do YYYY');
  },
  defaultSummary: (ev, instance) => {
    return 'No summary found.\nMaybe they will add one soon?\nKeep your fingers crossed.'
  },
  isFollowing: () => {
    let profileName = FlowRouter.getParam('profile_name')
    let profileUser = UserUtils.findUserByProfileName( profileName );
    let followUser  = Blaze.getData();

    // Check to see if a follow exists
    return Follows.findOne({
      fromUserId: profileUser._id,
      toUserId:   followUser._id
    });
  },
  profileLink: () => '/'+Blaze.getData().username,

});

Template.profileFollow.events({
  "click button": function(ev, instance) {
    Meteor.call('toggleFollowing', Blaze.getData().username);
  }
});
