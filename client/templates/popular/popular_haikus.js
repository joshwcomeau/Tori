Template.popularHaikus.onCreated(function() {
  this.limit = new ReactiveVar(4);
  this.loading = new ReactiveVar(false);

  this.autorun( () => {
    let haikuSubscription = this.subscribe( 'popularHaikus', this.limit.get() );
    if ( haikuSubscription.ready() ) {
      this.loading.set(false);
    }
  });

  // Load more haikus when the user scrolls near the bottom
  PaginationHelper(this.limit, this.loading);

});

Template.popularHaikus.helpers({
  loading: () => Template.instance().loading.get(),
  haikus: () => Haikus.find({}, { sort: { likeCount: -1 } })
});
