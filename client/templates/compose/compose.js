Template.compose.onCreated(function() {
  this.backgroundImage = new ReactiveVar(null);
});

Template.compose.helpers({
  composing: function() {
    return Session.get('composingHaiku');
  },
  backgroundImage: function() {
    return Template.instance().backgroundImage.get();
  }
});

Template.compose.events({
  'click .close': () => { Session.set('composingHaiku', undefined); },
  'click .haiku-box': () => {
    // We want to transfer focus to the text element, which can be positioned
    // more precisely.
    $(".placeholder").hide();
    $(".haiku-text").focus();
  },
  'click .preset': function(ev, instance) {
    $thumb = $(ev.target);
    let image_url = $thumb.css('background-image');
    instance.backgroundImage.set(image_url);
    
    // Add the 'selected' class to this thumbnail
    $('.preset').removeClass('selected');
    $thumb.addClass('selected')
  },
  'submit .post-haiku': function(ev, instance) {
    console.log("Form submitted")
    ev.preventDefault();
    
    // Find our Haiku text, and split it into 3 lines.
    let haiku_lines = $(ev.target)
      .find('.haiku-text')
      .html()
      .replace(/<\/div>/gi, '')
      .replace(/<div>/gi, '<br>')
      .split('<br>');
    
    console.log('instance', instance)
    
    if ( haiku_lines.length > 3 ) {
      // TODO: Error handling and displaying for too many lines
      return false;
    } else if ( haiku_lines.length < 3 ) {
      // TODO: Error handling/displaying for too few
      return false;
    }
    
    // TODO: Syllable checking. Ensure this is really a haiku!
    let attributes = {
      line1: haiku_lines[0],
      line2: haiku_lines[1],
      line3: haiku_lines[2]
    };

    
    if ( instance.backgroundImage.get() ) {
      attributes.backgroundImage = instance.backgroundImage.get();
    }
    
    console.log("Submitting haiku", attributes);
    Meteor.call('postHaiku', attributes);
    
    Session.set('composingHaiku', false);
    
    // TODO: Redirect to my profile page so I can see the Haiku I just posted?
  }
});