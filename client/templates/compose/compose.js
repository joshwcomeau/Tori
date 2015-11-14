Template.compose.onCreated(function() {
  this.backgroundImage = new ReactiveVar(null);
  this.usingPresetBackground = new ReactiveVar(false);
  this.uploader = new Slingshot.Upload("background");

  this.haiku = new ReactiveDict('haiku');
  this.haiku.set('body', '');

  document.execCommand('insertBrOnReturn', false, '<br><br>');

});


Template.compose.helpers({
  composing: function() {
    return Session.get('composingHaiku');
  },
  hasContent: function() {
    return !!Template.instance().haiku.get('body').length
  },
  formattedHaikuBody: function() {
    let haikuBody = Template.instance().haiku.get('body');
    return ComposeUtils.formatOutputHtml(haikuBody);
  },
  backgroundImage: function() {
    return Template.instance().backgroundImage.get();
  }
});


Template.compose.events({
  /**
   *  Close the 'compose' modal.
   *  Data is kept, it's just hidden from view.
   **/
  'click .close': () => Session.set('composingHaiku', undefined),

  /**
   *  Focus the pseudo-textarea to begin typing
   **/
  'click .haiku-box': (ev) => {
    // We want to transfer focus to the text element, which can be positioned
    // more precisely.
    $(".placeholder").hide();
    $(".haiku-text").focus();
    // TODO: Update this when the 'set' method is improved.
    // ComposeUtils.setCursorOffset(ev.target);
  },

  /**
   *  Select one of the preset background images. Instantly updates the textarea.
   **/
  'click .preset': function(ev, instance) {
    $thumb = $(ev.target);
    let image_css = $thumb.css('background-image');
    instance.backgroundImage.set(image_css);
    instance.usingPresetBackground.set(true);

    // Add the 'selected' class to this thumbnail
    $('.background-select-option').removeClass('selected');
    $thumb.addClass('selected');
  },

  /**
   *  Upload your own background image instead of using a preset.
   *  Uploads the file to S3 but latency-compensates by displaying it immediately.
   **/
  'change .upload-background': function(ev, instance) {
    ev.preventDefault();

    instance.usingPresetBackground.set(false);

    // Latency compensation
    Tracker.autorun( () => {
      // If we've switched over to using a preset, don't un-set the preset
      // when our upload completes and the upload URL changes.
      if ( !instance.usingPresetBackground.get() ) {
        instance.backgroundImage.set(
          ComposeUtils.wrapImageUrl( instance.uploader.url(true) )
        );
      }
    });

    // Mark the 'upload' button (instead of one of the preset thumbs) as selected.
    $('.background-select-option').removeClass('selected');
    $(ev.target).addClass('selected');

    // Send to S3!
    instance.uploader.send(ev.target.files[0], (error, image_url) => {
      if (error) {
        console.error('Error uploading', instance.uploader.xhr.response);
        alert (error);
      }
    });
  },


  'keyup #haiku-body': function(ev, instance) {
    // New strategy!
    // The div the user is entering will never be modified; too many variables.
    // Instead, there's a second <div> right behind the one the user is editing.
    // It is updated on keyup with the text entered into the first.
    // That text is formatted - wrapped in <span>s around each syllable.
    // The bare text itself (with <br> newlines) is stored in our `haiku`
    // reactiveDict. This is our authoritative source - it receives its input
    // from this container, and is output to the other (and to the server
    // on form submit).

    let key_pressed = ev.keyCode;

    // Make 'enter' key spawn double-BRs instead of DIVs.
    if (key_pressed === 13) {
      // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
      document.execCommand('insertHTML', false, '<br><br>');
      // prevent the default behaviour of return key pressed
      return false;
    }

    // Ignore arrow keys, shift key, delete/backspace
    if ( _.includes([8, 16, 37, 38, 39, 40, 46], key_pressed) ) return

    let text = $(ev.target).html();

    console.log(text);
    instance.haiku.set('body', text)
    // // Remove any <span>s added for illustrative purposes
    // text = text.replace(/<\/?span>/gi, '');
    //
    // // If the most recent action was a new line, we need to ignore and preserve it
    // let endsWithBreak = _.endsWith(text, '<br><br>');
    //
    // // Split into lines
    // let lines = _.compact(text.split('<br>'));
    //
    // // Break each line into an array of its words
    // lines = lines.map( line => {
    //   let words = _.compact(line.split(' '));
    //
    //   words = words.map( word => {
    //     // Break each word into an array of its syllables
    //     let syllables = ParseSyllables(word);
    //
    //     // Wrap each syllable in a span
    //     syllables = syllables.map( syllable => `<span>${syllable}</span>` );
    //
    //     // Join each syllable
    //     return syllables.join("");
    //
    //   });
    //
    //   // join each word with a space
    //   return words.join(" ");
    //
    // });
    //
    // // Join each line with a linebreak
    // lines = lines.join("<br>");
    //
    // // Replace any removed final linebreak
    // if ( endsWithBreak ) lines += "<br><br>";
    //
    // let initialCursorOffset = ComposeUtils.getCursorOffset(ev.target);
    //
    //
    //
    // $(ev.target).html(lines);
    //
    // ComposeUtils.setCursorOffset(ev.target, initialCursorOffset);

  },

  'submit .post-haiku': function(ev, instance) {
    ev.preventDefault();

    // Find our Haiku text, and split it into 3 lines.
    let haiku_lines = $(ev.target)
      .find('.haiku-text')
      .html()
      .replace(/<\/div>/gi, '')
      .replace(/<\/?span>/gi, '')
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
