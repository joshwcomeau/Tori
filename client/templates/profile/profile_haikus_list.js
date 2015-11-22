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

    // Find all the Haiku IDs for haiku/share events
    let eventIds = Events.find({
      eventType: { $in: ['share', 'haiku'] }
    }).map( (event) => event.haikuId);

    // Find all Haikus associated with each event
    // We need to fetch() them, so that we can sort by it's Event createdAt.
    haikus = Haikus.find({ _id: { $in: eventIds } }).fetch();

    // Sort time!
    return _.sortBy(haikus, (haiku) => {
      // Find the corresponding Event
      return Events.findOne({ haikuId: haiku._id }).createdAt
    }).reverse();

  }
});
