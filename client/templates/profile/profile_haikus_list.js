Template.profileHaikusList.onCreated(function() {
  let haikuIds = new ReactiveVar;

  this.autorun( () => {
    this.subscribe('activeProfile', FlowRouter.getParam('profile_name'));
    this.subscribe('activeProfileHaikus', FlowRouter.getParam('profile_name'));

    // We request the initial list of haikus based on the profile_name param.
    // We still need to fetch the current user's interactions with the haikus,
    // though. To do that, we assign a reactiveVar to the list of available
    // haikus in the autorun below. When the `activeProfileHaikus` subscription
    // finishes, it updates the reactiveVar, which causes this subscription
    // to re-fire.
    if ( !_.isEmpty(haikuIds.get()) ) {
      this.subscribe('myInteractionsWithHaikus', haikuIds.get() );
    }


  });

  this.autorun( () => {
    // Set our reactive var to the list of available Haiku IDs.
    haikuIds.set( Haikus.find().map( (haiku) => haiku._id ) );
  });
});

Template.profileHaikusList.helpers({
  activeProfileLoaded: () => {
    return Meteor.users.find({
      username: FlowRouter.getParam('profile_name')
    }).count();
  },
  haikus: function() {
    profile = UserUtils.findUserByProfileName(
      FlowRouter.getParam('profile_name')
    );

    // Find all the Haiku IDs for haiku/share events
    let eventIds = Events.find({
      eventType: { $in: ['share', 'haiku'] }
    }).map( (event) => event.haikuId);

    return Haikus.find({ _id: { $in: eventIds } });

    // Find all Haikus associated with each event
    // We need to fetch() them, so that we can sort by its Event createdAt.
    haikus = Haikus.find({ _id: { $in: eventIds } }).fetch();

    // Sort time!
    return _.sortBy(haikus, (haiku) => {
      // Find the corresponding Event
      return Events.findOne({ haikuId: haiku._id }).createdAt
    }).reverse();

  }
});
