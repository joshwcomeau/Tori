// Methods that aren't tightly associated with a single collection

if ( Meteor.isServer ) {
  Meteor.methods({
    // Marks either an Event or a Follow as seen.
    //
    markAsSeen: function(sourceId, sourceCollection) {
      check(sourceId, String);
      check(sourceCollection, String);

      global[sourceCollection].update(sourceId, { $set: { seen: true } });
    }
  });
}
