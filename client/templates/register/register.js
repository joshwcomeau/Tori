Template.register.onCreated(function() {
  this.user   = new ReactiveDict('registrationUser');
  this.errors = new ReactiveDict('registrationErrors');
  this.state  = new ReactiveDict('registrationState');
});

Template.register.rendered = function() {
  this.validator = new MagnesiumValidations("#register-form", this.user, this.errors);
};

Template.register.helpers({
  errorMessage: field => Template.instance().errors.get(field),
  errorClass:   field => !!Template.instance().errors.get(field) ? 'invalid' : 'valid',

  // User Fields
  username: () => Template.instance().user.get('username'),
  url:      () => Meteor.settings.public.SiteUrl + Template.instance().user.get('username'),
  email:    () => Template.instance().user.get('email'),
  photo:    () => Meteor.user().profile.photo,
});

Template.register.events({
  // Simple data binding between our User model and the DOM.
  'keyup .user-field': (ev, instance) => {
    let field = ev.target.id;
    let value = ev.target.value;

    instance.user.set(field, value);
  },

  'keyup .profile-field': (ev, instance) => {
    let field = ev.target.id;
    let value = ev.target.value;
    let profile = instance.user.get() || {};
    profile[field] = value;
    instance.user.set('profile', profile);
  },

  // Oauth - Twitter
  'click .twitter': (ev, instance) => {
    ev.preventDefault();

    Meteor.loginWithTwitter({}, function(err) {
      // TODO: Handle this error better
      if (err) console.error("PROBLEM WITH TWITTER OAUTH", err)
    });
  },

  'submit form': (ev, instance) => {
    ev.preventDefault();

    // This is either creating a user, or updating params on an existing user
    if ( Meteor.user() ) {
      // TODO: this.
    } else {
      let user_fields = {
        username: $("#username").val().toLowerCase(),
        email:    $("#email").val(),
        password: $("#password").val()
      }

      // TODO: Call this on the server, inside a Method, so I can do some
      // additional verifications. Ensure no one tries to use reserved
      // keywords like 'register' or 'haiku' for their username.
      Accounts.createUser(user_fields);
    }
  }

});
