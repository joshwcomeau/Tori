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
    let field = ev.target.id;
    let value = ev.target.value;
    
    instance.user.set(field, value);
    
    if ( ev.target.attributes['data-validate-alphanumeric'] ) {
      console.log("Validating", value, ValidationUtils.alphanumeric(value))
      if ( !ValidationUtils.alphanumeric(value) ) {
        instance.errors.set(ev.target.id, "This field can only contain letters, numbers and dashes.")
      } else {
        instance.errors.set(ev.target.id, undefined);
      }
    }
  }
  
});
