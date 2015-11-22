Template.feed.onCreated( function() {
  let haikuIds  = new ReactiveVar;
  this.limit    = new ReactiveVar(3);

  this.autorun( () => {
    this.subscribe( 'homeFeedHaikus', this.limit.get() );
    if ( !_.isEmpty(haikuIds.get()) ) {
      this.subscribe( 'myInteractionsWithHaikus', haikuIds.get() );
    }
  });

  this.autorun( () => {
    // Set our reactive var to the list of available Haiku IDs.
    haikuIds.set( Haikus.find().map( (haiku) => haiku._id ) );
  });
});

Template.feed.helpers({
  haikus: () => {
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

Template.feed.events({
  'click .load-more': (ev, instance) => {
    ev.preventDefault();
    instance.limit.set( instance.limit.get() + 3 )
  }
});
