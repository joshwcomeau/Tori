Template.compose.onCreated(function() {
  this.backgroundImage = new ReactiveVar(null);
  this.usingPresetBackground = new ReactiveVar(false);
  this.uploader = new Slingshot.Upload("background");

  this.haiku = new ReactiveDict('haiku');
  this.haiku.set({
    body:             '',
    syllables:        [ [], [], [] ],
    textColor:        'black',
    textAlign:        'center',
    textValign:       'center',
    imageAlign:       'center',
    imageValign:      'center',
    backgroundImage:  false
  });

  this.state = new ReactiveDict('state');
  this.state.set({
    showPlaceholder:    true,
    advancedMode:       false,
    highlightSyllables: true
  });

  // We have a few presets the user can choose from.
  // They will each have their own background images, font/overlay settings, etc.
  this.presets = [
    {
      default: true,
      presetName: 'no-bg',
      backgroundImage: false,
      backgroundThumb: '/images/no-background.png',
      textColor: 'black',
      textAlign: 'center',
      textValign: 'center',
      overlayColor: false,
      overlayDirection: false,
      imageAlign:       'center',
      imageValign:      'center'
    }, {
      presetName: 'flower-sun',
      backgroundImage: '/images/sample-background-1.jpg',
      backgroundThumb: '/images/sample-background-1.jpg',
      textColor: 'black',
      textAlign: 'center',
      textValign: 'top',
      overlayColor: 'white',
      overlayDirection: 'top',
      imageAlign:       'center',
      imageValign:      'center'
    }, {
      presetName: 'forest-bridge',
      backgroundImage: '/images/sample-background-2.jpg',
      backgroundThumb: '/images/sample-background-2.jpg',
      textColor: 'white',
      textAlign: 'right',
      textValign: 'bottom',
      overlayColor: 'black',
      overlayDirection: 'right',
      imageAlign:       'center',
      imageValign:      'center'
    }, {
      presetName: 'night-sky',
      backgroundImage: '/images/sample-background-3.jpg',
      backgroundThumb: '/images/sample-background-3.jpg',
      textColor: 'white',
      textAlign: 'center',
      textValign: 'center',
      overlayColor: false,
      overlayDirection: false,
      imageAlign:       'center',
      imageValign:      'top'
    }, {
      presetName: 'parchment',
      backgroundImage: '/images/sample-background-4.jpg',
      backgroundThumb: '/images/sample-background-4.jpg',
      textColor: 'black',
      textAlign: 'left',
      textValign: 'bottom',
      overlayColor: false,
      overlayDirection: false,
      imageAlign:       'center',
      imageValign:      'center'
    },
  ];

});

Template.compose.rendered = function() {
  if ( !this.rendered ) {
    // On initial render, add our presets to the dom
    // Our presets were defined in .onCreated.
    this.presets.reverse().forEach( (preset) => {
      let $node = $("<span>")
        .addClass('preset')
        .css('background-image', `url(${preset.backgroundThumb})`)
        .data(preset);

      if ( preset.default ) $node.addClass('selected');
      $(".presets").prepend($node);
    });
  }
};


Template.compose.helpers({
  // Composing State helpers
  showPlaceholder:        () => Template.instance().state.get('showPlaceholder'),
  highlightSyllables:     () => Template.instance().state.get('highlightSyllables'),
  advancedMode:           () => Template.instance().state.get('advancedMode'),

  // Haiku helpers
  haikuBackgroundImage:   () => Template.instance().haiku.get('backgroundImage'),
  haikuTextColor:         () => Template.instance().haiku.get('textColor'),
  haikuTextAlign:         () => Template.instance().haiku.get('textAlign'),
  haikuTextValign:        () => Template.instance().haiku.get('textValign'),
  haikuImageAlign:        () => Template.instance().haiku.get('imageAlign'),
  haikuImageValign:       () => Template.instance().haiku.get('imageValign'),
  haikuOverlayColor:      () => Template.instance().haiku.get('overlayColor'),
  haikuOverlayDirection:  () => Template.instance().haiku.get('overlayDirection'),
  formattedHaikuBody: function() {
    let syllables = Template.instance().haiku.get('syllables');
    let body      = Template.instance().haiku.get('body');
    console.log("Formatting", ComposeUtils.formatSyllables(syllables, body))
    return ComposeUtils.formatSyllables(syllables, body);
  },

  syllableCount: (lineNum) => {
    let syllables = Template.instance().haiku.get('syllables');
    if ( !syllables[lineNum] ) return 0;

    return _.flatten(syllables[lineNum]).length;
  },
  syllableHeight: (lineNum) => {
    let max = lineNum === 1 ? 7 : 5;
    let syllables = Template.instance().haiku.get('syllables');

    if ( !syllables[lineNum] ) return '0%';

    let length = _.flatten(syllables[lineNum]).length;
    return ( length / max) * 100 + "%";
  },
  syllablePerfect: (lineNum) => {
    let max = lineNum === 1 ? 7 : 5;
    let syllables = Template.instance().haiku.get('syllables');
    if ( !syllables[lineNum] ) return 0;

    return _.flatten(syllables[lineNum]).length === max;
  },

  // Misc helpers
  modalOpen:              () => UiUtils.modal.isActive('composingHaiku')

});


Template.compose.events({
  /**
   *  By default, all body clicks close modals.
   *  To prevent legitimate clicks from closing this window, we need to stop
   *  the event from bubbling up to the `body` element.
   */
  'mouseup #compose': function(ev, instance) {
    // We have a window handler to close the login popup. We want this to run
    // except when the log-in menu, or one of its children, is clicked.
    // Because of how events bubble, this trick will ensure that any click
    // within the menu doesn't close the menu =)
    ev.stopPropagation();
  },

  /**
   *  Close the 'compose' modal.
   *  Data is kept, it's just hidden from view.
   */
  'click .close': () => UiUtils.modal.deactivate(),

  /**
   *  Focus the pseudo-textarea to begin typing
   */
  'click .haiku': (ev) => {
    // We want to transfer focus to the text element, which can be positioned
    // more precisely.
    $("#haiku-body").focus();
  },

  /**
   *  Select one of the preset background images. Instantly updates the textarea.
   */
  'click .preset': function(ev, instance) {
    // We need to do 2 things here:
    // 1) Mark the thumb as selected, visually.
    // 2) Update our `haiku` object with the properties held herein.

    // 1) Remove the 'selected' class from others, add it to this one.
    $('.preset, .custom').removeClass('selected');
    $(ev.target).addClass('selected');

    // 2) update our reactiveDict.
    let data = $(ev.target).data();
    // Most of the data attached to the preset is useful, there are just a
    // couple of superfluous bits. Remove them.
    let pertinent_data = _.omit(data, ['default', 'backgroundThumb']);
    instance.haiku.set(pertinent_data);
  },

  /**
   *  Upload your own background image instead of using a preset.
   *  Uploads the file to S3 but latency-compensates by displaying it immediately.
   */
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

  /** Hide the placeholder when the Haiku textfield is focused */
  'focus #haiku-body': function(ev, instance) {
    instance.state.set('showPlaceholder', false);
  },

  /** Show the placeholder when the Haiku textfield is blurred and is still empty */
  'blur #haiku-body': function(ev, instance) {
    if ( !instance.haiku.get('body').length )
      instance.state.set('showPlaceholder', true);
  },

  /**
    * Special behaviour for enter key
    * ensure <br> tags are created instead of <div>s
    */
  'keydown #haiku-body': ComposeUtils.handleEnterKey,

  /**
    * Our main Haiku-writing method.
    * Sets our Dict's body to the contents, which updates a couple of helpers.
    */
  'keyup #haiku-body': function(ev, instance) {
    let text = $(ev.target).html();

    // Let's get our syllables array, so it can be used in various places.
    instance.haiku.set('syllables', ComposeUtils.buildSyllablesArray(text));
    instance.haiku.set('body', text);
  },

  /**
    * Submit the Haiku to the server, ready to be published.
    */
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
