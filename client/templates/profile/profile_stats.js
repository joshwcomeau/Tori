Template.profileStats.onCreated(function() {
  this.autorun( () => this.subscribe(
    'activeProfile', FlowRouter.getParam('profile_name'))
  );
});

Template.profileStats.helpers({
  profile: function() {
    return UserUtils.findUserByProfileName( FlowRouter.getParam('profile_name') );
  },
  isSelected: (routeName) => {
    if ( FlowRouter.getRouteName() === routeName ) return 'selected'
  },
  getLink: (routeName) => {
    let profileName = FlowRouter.getParam('profile_name');
    return FlowRouter.path(routeName, { profile_name: profileName });
  }
});
