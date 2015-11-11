ValidationUtils = {
  alphanumeric: function(input) {
    // Blank fields are alright, that's a separate ('required') validation.
    let alphanumeric_regex = /^[a-z0-9\-]*$/gi;
    
    return alphanumeric_regex.test(input);
  }
}
