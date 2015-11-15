Template.header.events({
  'click .compose-button': function(ev, instance) {
    ev.stopPropagation();
    UiUtils.modal.activate('composingHaiku');
  }
})
