Template.profileHaikusList.onCreated(function() {
  this.limit = new ReactiveVar(4);
  this.loading = new ReactiveVar(true);
  let profileName = FlowRouter.getParam('profile_name');

  // Moved this out of the autorun because it doesn't need to be reactive.
  this.subscribe( 'activeProfile', profileName );

  this.autorun( () => {
    let haikuSubscription = this.subscribe( 'activeProfileHaikus', profileName, this.limit.get() );

    // We request the initial list of haikus based on the profile_name param.
    // We still need to fetch the current user's interactions with the haikus,
    // though. To do that, we assign a reactiveVar to the list of available
    // haikus in the autorun below. When the `activeProfileHaikus` subscription
    // finishes, it updates the reactiveVar, which causes this subscription
    // to re-fire.
    if ( haikuSubscription.ready() ) {
      let haikuIds = Haikus.find().map( (haiku) => haiku._id )
      this.subscribe( 'myInteractionsWithHaikus', haikuIds );
      this.loading.set(false);
    }
  });

  // Load more haikus when the user scrolls near the bottom
  PaginationHelper(this.limit, this.loading);
});

Template.profileHaikusList.helpers({
  loading: () => Template.instance().loading.get(),

  haikus: function() {
    // Find all the Haiku IDs for haiku/share events
    let eventIds = Events.find({
      eventType: { $in: ['share', 'haiku'] }
    }).map( (event) => event.haikuId );

    // Find all Haikus associated with each event
    // We need to fetch() them, so that we can sort by its Event createdAt.
    haikus = Haikus.find({ _id: { $in: eventIds } }).fetch();

    // Sort time!
    let sortedList = _.sortBy(haikus, (haiku) => {
      // Find the corresponding Event
      return Events.findOne({ haikuId: haiku._id }).createdAt
    }).reverse();

    return sortedList;
  },

  // TODO: Smarten this? What if there are Haikus loaded for another reason?
  noHaikus: () => Haikus.find().count() === 0
});
