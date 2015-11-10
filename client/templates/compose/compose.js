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
  'click .close': () => Session.set('composingHaiku', undefined),
  
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
    
    // Remove any <span>s added for illustrative purposes
    text = text.replace(/<[\/]?span>/gi, '');
    
    console.log("Replaced text", text);
    
    // If the most recent action was a new line, we need to ignore and preserve it
    let endsWithBreak = _.endsWith(text, '<br><br>');
    
    // Split into lines
    let lines = _.compact(text.split('<br>'));
    
    console.log("split lines", lines)
    
    // Break each line into an array of its words
    lines = lines.map( line => {
      let words = _.compact(line.split(' '));
      
      words = words.map( word => {
        // Break each word into an array of its syllables
        let syllables = ParseSyllables(word);
        
        // Wrap each syllable in a span
        syllables = syllables.map( syllable => `<span>${syllable}</span>` );
        
        // Join each syllable
        return syllables.join("");
        
      });
      
      // join each word with a space
      return words.join(" ");
      
    });
    
    // Join each line with a linebreak
    lines = lines.join("<br>");
    
    // Replace any removed final linebreak
    if ( endsWithBreak ) lines += "<br><br>"
    
    console.log("lines:", lines)
    
    // // Break eah
    // lines = lines.map( (line) => {
    //   let words = _.compact(line.split(' '))
    //   return _.flatten(words.map( word => ParseSyllables(word) ));
    // });
    //
    // console.log("Syllable lines", lines)
    //
    // // TODO: Add the little numbers to count each syllable per line.
    //
    // // Find each syllable, in the original text, and wrap it in a span.
    //
    // // Flatten the lines, for simplicity. We no longer need a 2D array.
    // let wrapped_syllables = lines.map( (line) => {
    //   return line.map( syllable => `<span class='syllable'>${syllable}</span>`).join
    // }).join('<br>');
    //
    // console.log("wrapped_syllables", wrapped_syllables)
    //
    $(ev.target).html(lines);
    
    Utils.jumpToEnd(ev.target);
    
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
