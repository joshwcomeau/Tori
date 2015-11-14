Template.header.events({
  'click .compose-button': function(ev, instance) {
    ev.stopPropagation();
    console.log("Activating composingHaiku")
    UiUtils.modal.activate('composingHaiku');
  }
})
