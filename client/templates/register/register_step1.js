Template.registerStep1.onCreated(function() {
  this.user   = new ReactiveDict('registrationUserStep1');
  this.errors = new ReactiveDict('registrationErrorsStep1');
});
Template.registerStep1.onDestroyed(function() {
  delete ReactiveDict._dictsToMigrate['registrationUserStep1'];
  delete ReactiveDict._dictsToMigrate['registrationErrorsStep1'];
});

Template.registerStep1.rendered = function() {
  this.validator = new MagnesiumValidations("#register-form-step1", this.errors);
};

Template.registerStep1.helpers({
  errorMessage: field => Template.instance().errors.get(field),
  errorClass:   field => !!Template.instance().errors.get(field) ? 'invalid' : 'valid',

  // User Fields
  username: () => Template.instance().user.get('username'),
  email:    () => Template.instance().user.get('email'),
  password: () => Template.instance().user.get('password'),
});

Template.registerStep1.events({
  // Simple data binding between our User model and the DOM.
  'keyup .user-field': (ev, instance) => {
    let field = ev.target.id;
    let value = ev.target.value;

    instance.user.set(field, value);
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

    // Get an array of non-undefined errors
    let errors = _.compact(_.values(instance.errors.all()));
    // don't submit if there are errors.
    if ( errors.length ) return;

    let userFields = {
      username: _.trim(instance.user.get('username').toLowerCase()),
      email:    _.trim(instance.user.get('email')),
      password: instance.user.get('password')
    };

    Accounts.createUser(userFields, function(err, response) {
      if ( !err ) return;

      switch (err.reason) {
        case 'Username already exists.':
          instance.errors.set('username', 'Sorry, someone else has already taken that username. What a jerk.');
          break;
        case 'Email already exists.':
          instance.errors.set('email', 'This email has already been used to register for an account! Are you trying to log in?');
          break;
        case 'reserved-username':
          instance.errors.set('username', err.details);
          break;
      }
    });
  }

});
