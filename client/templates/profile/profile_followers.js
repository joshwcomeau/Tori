Template.profileFollowers.onCreated(function() {
  let instance = this;
  let profileName = FlowRouter.getParam('profile_name');

  instance.autorun(() => {
    console.log("Autorunning", profileName)
    instance.subscribe('activeProfileFollowers', profileName);
  })
});
