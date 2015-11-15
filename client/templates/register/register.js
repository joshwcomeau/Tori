Template.register.onCreated(function() {
  this.user   = new ReactiveDict('registrationUser');
  this.errors = new ReactiveDict('registrationErrors');
  this.state  = new ReactiveDict('registrationState');

  ValidationUtils.registerValidations(Template.register, 'keyup', {
    '#username':  ['required', 'alphanumeric'],
    '#email':     ['required', 'email']
  });
});

Template.register.helpers({
  errorMessage: field => Template.instance().errors.get(field),
  errorClass:   field => !!Template.instance().errors.get(field) ? 'has-error' : '',

  // User Fields
  username: () => Template.instance().user.get('username'),
  url:      () => Meteor.settings.public.SiteUrl + Template.instance().user.get('username'),
  email:    () => Template.instance().user.get('email'),
  photo:    () => Meteor.user().profile.photo,

  // State stuff
  firstButtonAttributes: () => {
    // On the first step, we can green-light the button if there are no
    // errors and we have input in the 3 required fields.
    // let required_fields = [ $('#email'), $('#password'), $('#username') ];
    //
    // let valid = _.every(required_fields, ($field) => {
    //   return !_.isEmpty($field.val()) && !$field.parent().hasClass('has-error')
    // });
    //
    // console.log("Valid?", valid)
    //
    // return {
    //   disabled: valid
    // };
  }

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

      Accounts.createUser(user_fields);
    }
  }

});
