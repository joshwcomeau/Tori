Template.header.events({
  'click .compose-button': function(ev, instance) {
    Session.set('composingHaiku', true);
  }
})