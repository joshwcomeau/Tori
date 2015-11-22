// Template assumes that the necessary Haiku and its events are being
// subscribed to by its parent templates. It's either that, or depend on
// the URL params. This feels slightly less decoupled.
Template.haikuEventsList.helpers({
  events: function() {
    return Events.find({ haikuId: this._id}, { sort: { createdAt: -1 } });
  },
  noEvents: function() {
    return Events.find({ haikuId: this._id}).count() === 0
  }
});
