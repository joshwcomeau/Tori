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
    let field     = this;
    let $field    = $(field);
    let field_id  = $field.attr('id');

    $field.addClass('pristine').addClass('untouched');

    $field.on('blur', function() {
      $field.removeClass('untouched').addClass('touched');
    });

    // Our main validations loop.
    $field.on('keyup', function() {
      $field.removeClass('pristine').addClass('dirty');

      // Turn the list of mg- attributes into an object
      let mgAttributes = pickMgAttributes(this.attributes);
      console.log(mgAttributes)

      // Ensure that every Mg attribute has its conditions met.
      _.every(mgAttributes, (validationValue, validationName) => {
        console.log("Calling", validationName, validationValue)
        self.validators[validationName].call( field, validationValue );
      })

    });
  });


  self.validators.required = function(isRequired) {
    if ( !isRequired ) return true;

    let $field     = $(this);
    let fieldValue = $field.val();
    let fieldName  = $field.attr('id');

    if ( fieldValue == '' ) {
      self.errors.set(fieldName, "This field is required!");
      $field.removeClass('valid').addClass('invalid');
      return false;
    } else {
      self.errors.set(fieldName, undefined);
      $field.removeClass('invalid').addClass('valid');
      return true;
    }
  };

  self.validators.email = function(isRequired) {
    if ( !isRequired ) return true;

    let $field     = $(this);
    let fieldValue = $field.val();
    let fieldName  = $field.attr('id');

    let email_regex = /[A-Z0-9\._\+-]+@[A-Z0-9\.-]+\.[A-Z]{2,16}/i;

    if ( !email_regex.test(fieldValue) ) {
      self.errors.set(fieldName, "Please enter a valid email.");
      $field.removeClass('valid').addClass('invalid');
      return false;
    } else {
      self.errors.set(fieldName, undefined);
      $field.removeClass('invalid').addClass('valid');
      return true;
    }
  };

  self.validators.alphanumeric = function(ev) {
    if ( !isRequired ) return true;

    let $field     = $(this);
    let fieldValue = $field.val();
    let fieldName  = $field.attr('id');

    let alphanumeric_regex = /^[a-z0-9\-]*$/gi;

    if ( !alphanumeric_regex.test(value) ) {
      self.errors.set(fieldName, "This field can only contain letters, numbers and dashes.");
      $field.removeClass('valid').addClass('invalid');
      return false;
    } else {
      self.errors.set(fieldName, undefined);
      $field.removeClass('invalid').addClass('valid');
      return true;
    }
  };

  self.validators.maxLength = function(max) {
    console.log("Called maxLength")
    if ( !isRequired ) return true;

    let $field     = $(this);
    let fieldValue = $field.val();
    let fieldName  = $field.attr('id');

    console.log("Checking if ", fieldValue.length, "is greater than", max)

    if ( fieldValue.length > max ) {
      self.errors.set(fieldName, `This field is limited to ${max} characters.`);
      $field.removeClass('valid').addClass('invalid');
      return false;
    } else {
      self.errors.set(fieldName, undefined);
      $field.removeClass('invalid').addClass('valid');
      return true;
    }
  };

};

// PRIVATE FUNCTIONS
let pickMgAttributes = function(nodeMap) {
  // Receives a jquery NamedNodeMap where the values are `type="text"`.
  // Convert that into a plain ol' JS object where the key is the property
  // name, and the value is its value.
  let attributes = {}

  $.each(nodeMap, function() {
    if ( this.name.match(/^mg-/i) ) {
      let scrubbedName = _.camelCase(this.name.replace(/^mg-/i, ''));
      attributes[scrubbedName] = this.value;
    }
  });

  return attributes;
}
