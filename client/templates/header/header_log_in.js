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
  },
  'submit .log-in-form': function(ev, instance) {
    ev.preventDefault();
    
    let $form = $(ev.target);
    let email_or_username = $form.find('[name=email_username]').val();
    let password = $form.find('[name=password]').val();
    
    // TODO: some form of basic validation.
    
    Meteor.loginWithPassword(email_or_username, password, function(error) {
      console.log("Login context", this);
      
      if ( error ) {
        // TODO: Error handling
        console.error( "Error logging in:", error );
      } else if ( !Meteor.user() ){
        console.error( "No formal error logging in, but we aren't logged in =(");
      } else {
        // Success! Just close the window.
        instance.loginMenuOpen.set(false);
      }
    });
  }
})