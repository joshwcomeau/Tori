// This library works using a reactiveDict as the central state manager.
// It doesn't handle what to do if the validations pass or fail, and thus is
// not currently suitable for submit-level validation. Works best on keyup or blur.
// To use it, call it with the template to bind to, the event to listen for,
// and a dictionary of fields to check and validators to run on those fields.

ValidationUtils = {
  /**
   * Our main method, builds and assigns our validation events
   * @param {Object} template - The template that the events are being registered on.
   * @param {String} domEvent - the event we're validating on (eg. blur, keyup, etc)
   * @param {Object} fields   - an object of the fields we're validating. The key should be a CSS selector for the input, the value should be an array of the validations we want to register.
   */
  registerValidations: function(template, domEvent, fields) {
    _.forEach(fields, (validators, field) => {
      // For a given field, there may be multiple validations (eg. required + alphanumeric).

      let events_object = {}
      let events_key    = `${domEvent} ${field}`;
      let events_value  = (ev, instance) => {
        console.log("inside event")
        // We need to iterate through each registered validation,
        // and stop when we find one that returns false.
        _.all(validators, validator => ValidationUtils[validator](ev, instance) )
      };

      events_object[events_key] = events_value;
      template.events(events_object);

    });


  },
  required: function(ev, instance) {
    let field = ev.target.id;
    let value = ev.target.value;

    console.log("it is", value)

    if ( value == '' ) {
      instance.errors.set(field, "This field is required!");
    } else {
      instance.errors.set(field, undefined);
      return true;
    }
  },

  alphanumeric: function(ev, instance) {
    let field = ev.target.id;
    let value = ev.target.value;

    console.log("Checking alphanumeric", value)

    let alphanumeric_regex = /^[a-z0-9\-]*$/gi;

    if ( !alphanumeric_regex.test(value) ) {
      instance.errors.set(field, "This field can only contain letters, numbers and dashes.");
    } else {
      instance.errors.set(field, undefined);
      return true;
    }
  }
}
