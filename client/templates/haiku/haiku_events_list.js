// Template assumes that the necessary Haiku and its events are being
// subscribed to by its parent templates. It's either that, or depend on
// the URL params. This feels slightly less decoupled.
Template.haikuEventsList.helpers({
  events: function() {
    console.log("Searching for", this, this._id)
    return Events.find({ haikuId: this._id})
  }
});
