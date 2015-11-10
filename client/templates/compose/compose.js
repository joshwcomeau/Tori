Template.compose.onCreated(function() {
  this.backgroundImage = new ReactiveVar(null);
  this.uploader = new Slingshot.Upload("background");
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
    let image_css = $thumb.css('background-image');
    instance.backgroundImage.set(image_css);
    
    // Add the 'selected' class to this thumbnail
    $('.preset').removeClass('selected');
    $thumb.addClass('selected');
  },
  
  'change .upload-background': function(ev, instance) {
    ev.preventDefault();
        
    let file = ev.target.files[0];
    
    instance.uploader.send(file, (error, image_url) => {
      if (error) {
        console.error('Error uploading', instance.uploader.xhr.response);
        alert (error);
      } else {
        console.log("Uploaded file!", image_url);
        
        let image_css = `url('${image_url}')`;
        instance.backgroundImage.set(image_css)
        
      }
    });
  },
  
  'keydown .haiku-text': function(ev, instance) {
    // Make 'enter' key spawn double-BRs instead of DIVs.
    if (ev.keyCode === 13) {
      // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
      document.execCommand('insertHTML', false, '<br><br>');
      // prevent the default behaviour of return key pressed
      return false;
    }
  },
  
  'keyup .haiku-text': function(ev, instance) {
    let text = $(ev.target).html();
    
    // Split into lines
    let lines = _.compact(text.split('<br>'));
    
    // Break each line into an array of its syllables
    lines = lines.map( (line) => {
      let words = _.compact(line.split(' '))
      return _.flatten(words.map( word => ParseSyllables(word) ));
    });
    
    console.log( lines );
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
    
    Meteor.call('postHaiku', attributes);
    
    Session.set('composingHaiku', false);
    
    // TODO: Redirect to my profile page so I can see the Haiku I just posted?
  }
});
