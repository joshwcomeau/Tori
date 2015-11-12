Template.register.onCreated(function() {
  this.user = new ReactiveDict('user');
  this.errors = new ReactiveDict('errors');

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
    Meteor.loginWithTwitter({}, function(err) {
      // TODO: Handle this error better
      if (err) console.error("PROBLEM WITH TWITTER OAUTH", err)
    });
  }

});
