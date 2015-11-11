Template.register.onCreated(function() {
  this.user = new ReactiveDict('user');
  this.errors = new ReactiveDict('errors');
});

Template.register.helpers({
  username: () => Template.instance().user.get('username'),
  url: () => Meteor.settings.public.SiteUrl + Template.instance().user.get('username'),
  email: () => Template.instance().user.get('email'),
  errorMessage: field => Template.instance().errors.get(field),
  errorClass: field => !!Template.instance().errors.get(field) ? 'has-error' : ''
});

Template.register.events({
  'keyup .user-field': (ev, instance) => {
    instance.user.set(ev.target.id, ev.target.value);
    
    // I've set up some generic error handling using data-attributes in the template.
    console.log(ev);
    
    if ( ev.target.attributes['data-validate-alphanumeric'] ) {
      // TODO: Validations.
      instance.errors.set(ev.target.id, "This field can only contain letters, numbers and dashes.")
    }
  }
  
});