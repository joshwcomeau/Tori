Template.profileHaikusList.onCreated(function() {
  this.autorun( () => {
    this.subscribe('activeProfile', FlowRouter.getParam('profile_name'));
    this.subscribe('activeProfileHaikus', FlowRouter.getParam('profile_name'));
  });
});

Template.profileHaikusList.helpers({
  haikus: function() {
    profile = UserUtils.findUserByProfileName(
      FlowRouter.getParam('profile_name')
    );

    console.log("Haikus helper running")

    // Find all the Haiku IDs for haiku/share events
    let events = Events.find({
      eventType: { $in: ['share', 'haiku'] }
    }, {
      sort: { createdAt: -1 }
    }).fetch();

    let eventHaikuIds = _.pluck(events, 'haikuId');

    console.log("Found event IDs", eventHaikuIds)

    // Find all Haikus posted
    return Haikus.find({ _id: { $in: eventHaikuIds } });
  }
});
