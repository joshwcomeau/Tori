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

      // We need to pass a function that makes sure ALL the validations pass.
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

      // validators.forEach( (validator) => {
      //   let events_object = {}
      //   // We want to mimic the normal 'events' syntax.
      //   // The key is the event, followed by the selector (eg. 'keyup .name')
      //   // The value is a function that runs on that event.
      //   let events_key = `${domEvent} ${field}`;
      //   let events_value = ValidationUtils[validator];
      //
      //   events_object[events_key] = events_value;
      //   template.events(events_object);
      // });
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
