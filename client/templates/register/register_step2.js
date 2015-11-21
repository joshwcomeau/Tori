Template.registerStep2.onCreated(function() {
  this.user   = new ReactiveDict('registrationUserStep2');
  this.errors = new ReactiveDict('registrationErrorsStep2');
});
Template.registerStep1.onDestroyed(function() {
  delete ReactiveDict._dictsToMigrate['registrationUserStep2'];
  delete ReactiveDict._dictsToMigrate['registrationErrorsStep2'];
});

Template.registerStep2.rendered = function() {
  this.validator = new MagnesiumValidations("#register-form-step2", this.errors);
};

Template.registerStep2.helpers({
  errorMessage: field => Template.instance().errors.get(field),
  errorClass:   field => !!Template.instance().errors.get(field) ? 'invalid' : 'valid',

  photo: () => Meteor.user().profile.photo,

});

Template.registerStep2.events({
  // Simple data binding between our User model and the DOM.
  'keyup .profile-field': (ev, instance) => {
    let field = ev.target.id;
    let value = ev.target.value;
    let profile = instance.user.get('profile') || {};
    profile[field] = value;
    instance.user.set('profile', profile);
  },

  'submit form': (ev, instance) => {
    ev.preventDefault();

    console.log("Form submitted")

    // Get an array of non-undefined errors
    let errors = _.compact(_.values(instance.errors.all()));
    // don't submit if there are errors.
    if ( errors.length ) return;

    let profile = instance.user.get('profile');

    Meteor.call('updateUserProfile', profile, function(err, response) {
      if ( !err ) return;

      switch (err.reason) {
        case 'Username already exists.':
          instance.errors.set('username', 'Sorry, someone else has already taken that username. What a jerk.')
          break;
      }
    });

  }

});
