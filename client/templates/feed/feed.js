Template.feed.onCreated( function() {
  this.limit    = new ReactiveVar(4);
  this.loading = new ReactiveVar(false);


  this.autorun( () => {
    let haikuSubscription = this.subscribe( 'homeFeedHaikus', this.limit.get() );
    if ( haikuSubscription.ready() ) {
      let haikuIds = Haikus.find().map( (haiku) => haiku._id );
      this.subscribe( 'myInteractionsWithHaikus', haikuIds );
      this.loading.set(false);
    }
  });

  // Load more haikus when the user scrolls near the bottom
  PaginationHelper(this.limit, this.loading);

});

Template.feed.helpers({
  loading: () => Template.instance().loading.get(),

  haikus: () => {
    // Find all the Haiku IDs for haiku/share events
    let eventIds = Events.find({
      eventType: { $in: ['share', 'haiku'] }
    }).map( (event) => event.haikuId);

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
