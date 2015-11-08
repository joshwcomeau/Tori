Template.compose.onCreated(function() {});

Template.compose.helpers({
  composing: function() {
    return Session.get('composingHaiku')
  }
});

Template.compose.events({
  'click .haiku-box': () => {
    // We want to transfer focus to the text element, which can be positioned
    // more precisely.
    $(".placeholder").hide();
    $(".haiku-text").focus();
  }
})