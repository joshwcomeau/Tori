/*
Magnesium Validations

To use: Simply add data attributes to the fields you'd like to validate:
data-required         = Boolean
data-email            = Boolean
data-min-length       = number
data-max-length       = number
data-alphanumeric     = Boolean
data-disable-on-keyup = Boolean

Similar to Angular validations, the following classes will be added:
  * valid:      the model is valid
  * invalid:    the model is invalid
  * pristine:   the control hasn't been interacted with yet
  * dirty:      the control has been interacted with
  * touched:    the control has been blurred
  * untouched:  the control hasn't been blurred
*/

MagnesiumValidations = function(form, model, errors) {
  let self = this;
  self.form = form;
  self.model = model;
  self.errors = errors;
  self.validators = {};

  // INITIALIZATION
  $(self.form).find('input, textarea').each( function(index) {
    let $field = $(this)
    let formId = $field.attr('id');

    $field.addClass('pristine').addClass('untouched');

    $field.on('blur', function() {
      $field.removeClass('untouched').addClass('touched');
    });

    $field.on('keyup', function() {
      $field.removeClass('pristine').addClass('dirty');

      // TODO: Loop through all the validations on this field.
      // If they ALL pass, add the 'valid' class. Otherwise, add 'invalid'
    });
  });


  self.validators.required = function(ev) {
    let property  = ev.target.id;
    let value     = ev.target.value;

    let $field    = $(ev.target);

    // We've used this field!
    if ( !$field.hasClass('dirty') ) $field.addClass('dirty')

    if ( value == '' ) {
      self.errors.set(property, "This field is required!");
    } else {
      self.errors.set(property, undefined);
      return true;
    }
  };

  self.validators.email = function(ev) {
    let field = ev.target.id;
    let value = ev.target.value;

    let email_regex = /[A-Z0-9\._\+-]+@[A-Z0-9\.-]+\.[A-Z]{2,16}/i;

    if ( !email_regex.test(value) ) {
      instance.errors.set(field, "Please enter a valid email!");
    } else {
      instance.errors.set(field, undefined);
      return true;
    }
  };

  self.validators.alphanumeric = function(ev) {
    let field = ev.target.id;
    let value = ev.target.value;

    let alphanumeric_regex = /^[a-z0-9\-]*$/gi;

    if ( !alphanumeric_regex.test(value) ) {
      instance.errors.set(field, "This field can only contain letters, numbers and dashes.");
    } else {
      instance.errors.set(field, undefined);
      return true;
    }
  };
};
