Template.headerLogIn.onCreated(function() {
  this.menuName = 'headerLogin';
  UiUtils.menu.registerWindowClickHandler();
});

Template.headerLogIn.helpers({
  menuOpen: function() {
    return UiUtils.menu.isMenuActive(Template.instance().menuName);
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
    UiUtils.menu.activate(instance.menuName);
  },
  'submit .log-in-form': function(ev, instance) {
    ev.preventDefault();
    
    let $form = $(ev.target);
    let email_or_username = $form.find('[name=email_username]').val();
    let password = $form.find('[name=password]').val();
    
    // TODO: some form of basic validation.
    
    Meteor.loginWithPassword(email_or_username, password, (err) => {
      if ( err ) {
        // TODO: Error handling
        console.error( "Error logging in:", err );
      } else if ( !Meteor.user() ){
        console.error( "No formal error logging in, but we aren't logged in =(");
      } else {
        // Success! Just close the window.
        instance.loginMenuOpen.set(false);
      }
    });
  }
})