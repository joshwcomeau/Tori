Template.headerLogIn.onCreated(function() {
  this.menuName = 'headerLogin';
});

Template.headerLogIn.helpers({
  menuOpen: function() {
    return UiUtils.modal.isActive(Template.instance().menuName);
  }
});

Template.headerLogIn.events({
  // We have a window handler to close the login popup. We want this to run
  // except when the log-in menu, or one of its children, is clicked.
  // Because of how events bubble, this trick will ensure that any click
  // within the menu doesn't close the menu =)
  'mouseup .log-in-menu': (ev, instance) => ev.stopPropagation(),

  'mouseup .log-in-text': (ev, instance) => {
    ev.stopPropagation();
    UiUtils.modal.activate(instance.menuName);
  },
  'click .button.twitter': (ev, instance) => {
    ev.preventDefault();
    Meteor.loginWithTwitter({}, function(err) {
      if (err) return console.error("PROBLEM WITH TWITTER OAUTH", err);
      FlowRouter.go('/')
    });
  },
  'submit .log-in-form': (ev, instance) => {
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
        UiUtils.modal.deactivate();
      }
    });
  },
  // When clicking a link (eg. Register now), we want to close the menu
  'click a': (ev, instance) => UiUtils.modal.deactivate()
})
