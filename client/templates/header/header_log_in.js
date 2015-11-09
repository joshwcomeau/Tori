Template.headerLogIn.onCreated(function() {
  this.loginMenuOpen = new ReactiveVar(false);
  // Close the menu when a click event is registered anywhere outside the menu
  $(window).on('mouseup', (ev) => {
    this.loginMenuOpen.set(false);
  });
});

Template.headerLogIn.helpers({
  menuOpen: function() {
    return Template.instance().loginMenuOpen.get();
  }
})

Template.headerLogIn.events({
  'mouseup .log-in-menu': function(ev, instance) {
    // We have a window handler to close the login popup. We want this to run
    // except when the log-in menu, or one of its children, is clicked.
    // Because of how events bubble, this trick will ensure that any click
    // within the menu doesn't close the menu =)
    ev.stopPropagation();
  },
  'mouseup .log-in-text': function(ev, instance) {
    ev.stopPropagation();
    instance.loginMenuOpen.set( !instance.loginMenuOpen.get() );
  }
})