Template.compose.onDestroyed( function() {
  delete ReactiveDict._dictsToMigrate['haiku'];
  delete ReactiveDict._dictsToMigrate['state'];
});

Template.compose.onCreated(function() {
  this.uploader = new Slingshot.Upload("background");
  this.haiku = new ReactiveDict('haiku');
  this.haiku.set({
    body:             '',
    syllables:        [ [] ],
    textColor:        'black',
    textAlign:        'center',
    textValign:       'center',
    showOverlay:      false,
    overlayColor:     'white',
    overlayDirection: 'center',
    backgroundAlign:  'center',
    backgroundValign: 'center',
    backgroundImage:  false
  });

  this.state = new ReactiveDict('state');
  this.state.set({
    showPlaceholder:    true,
    advancedMode:       false,
    highlightSyllables: false
  });

  // We have a few presets the user can choose from.
  // They will each have their own background images, font/overlay settings, etc.
  this.presets = [
    {
      default:          true,
      presetName:       'no-bg',
      backgroundImage:  false,
      backgroundThumb:  '/images/no-background.png',
      textColor:        'black',
      textAlign:        'center',
      textValign:       'center',
      showOverlay:      false,
      backgroundAlign:  'center',
      backgroundValign: 'center'
    }, {
      presetName:       'flower-sun',
      backgroundImage:  '/images/sample-background-1.jpg',
      backgroundThumb:  '/images/sample-background-1.jpg',
      textColor:        'black',
      textAlign:        'center',
      textValign:       'top',
      showOverlay:      true,
      overlayColor:     'white',
      overlayDirection: 'top',
      backgroundAlign:  'center',
      backgroundValign: 'center'
    }, {
      presetName:       'forest-bridge',
      backgroundImage:  '/images/sample-background-2.jpg',
      backgroundThumb:  '/images/sample-background-2.jpg',
      textColor:        'white',
      textAlign:        'right',
      textValign:       'bottom',
      showOverlay:      true,
      overlayColor:     'black',
      overlayDirection: 'right',
      backgroundAlign:  'center',
      backgroundValign: 'center'
    }, {
      presetName:       'night-sky',
      backgroundImage:  '/images/sample-background-3.jpg',
      backgroundThumb:  '/images/sample-background-3.jpg',
      textColor:        'white',
      textAlign:        'center',
      textValign:       'center',
      showOverlay:      false,
      backgroundAlign:  'center',
      backgroundValign: 'top'
    }, {
      presetName:       'parchment',
      backgroundImage:  '/images/sample-background-4.jpg',
      backgroundThumb:  '/images/sample-background-4.jpg',
      textColor:        'black',
      textAlign:        'left',
      textValign:       'bottom',
      showOverlay:      false,
      backgroundAlign:  'center',
      backgroundValign: 'center'
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
  advancedModeArrow:      () => {
    return Template.instance().state.get('advancedMode') ? 'down' : 'right'
  },
  advancedModeClasses:    () => {
    return {
      class: Template.instance().state.get('advancedMode') ? 'active' : undefined
    }
  },
  advancedModeSettings:    () => Template.instance().advancedModeSettings,

  // Haiku helpers
  syllableData:           () => Template.instance().haiku.get('syllables'),
  haikuTextColor:         () => Template.instance().haiku.get('textColor'),
  haikuTextAlign:         () => Template.instance().haiku.get('textAlign'),
  haikuTextValign:        () => Template.instance().haiku.get('textValign'),
  haikuBackgroundImage:   () => Template.instance().haiku.get('backgroundImage'),
  haikuBackgroundAlign:   () => Template.instance().haiku.get('backgroundAlign'),
  haikuBackgroundValign:  () => Template.instance().haiku.get('backgroundValign'),
  haikuShowOverlay:       () => Template.instance().haiku.get('showOverlay'),
  haikuOverlayColor:      () => Template.instance().haiku.get('overlayColor'),
  haikuOverlayDirection:  () => Template.instance().haiku.get('overlayDirection'),
  formattedHaikuBody: function() {
    let syllables = Template.instance().haiku.get('syllables');
    let body      = Template.instance().haiku.get('body');
    return ComposeUtils.formatSyllables(syllables, body);
  },
  haikuHasProperty:       (property, value) => {
    // If we don't pass in a value, we assume the property just needs to be truthy
    if ( typeof value === 'undefined' ) {
      return !!Template.instance().haiku.get(property);
    } else {
      return Template.instance().haiku.get(property) === value;
    }
  },

  // Misc helpers
  modalOpen:              () => UiUtils.modal.isActive('composingHaiku'),
  showProgressBar:        () => Template.instance().uploader.progress() < 1,
  progress:               () => Template.instance().uploader.progress() * 100
});


Template.compose.events({
  /**
   *  By default, all body clicks close modals.
   *  To prevent legitimate clicks from closing this window, we need to stop
   *  the event from bubbling up to the `body` element.
   */
  'mouseup #compose': (ev, instance) => ev.stopPropagation(),

  /**
   *  Close the 'compose' modal.
   *  Data is kept, it's just hidden from view.
   */
  'click .close': () => UiUtils.modal.deactivate(),

  /**
   *  Focus the pseudo-textarea to begin typing
   */
  'click .haiku': ev => $("#haiku-body").focus(),

  /**
   * Toggle 'Advanced Mode'.
   * Advanced mode features fine-grained control over text and image.
   */
  'click #advanced-mode-toggle': (ev, instance) => {
    instance.state.set( 'advancedMode', !instance.state.get('advancedMode') );
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
   *  Click one of the 'Advanced Mode' toggles. Behaviour is gleaned from
   *  data attributes
   */
  'click .control': function(ev, instance) {
    ev.preventDefault();

    // First: Find the button.
    // Because we're likely clicking an <i> or <img> inside the button,
    // we need to climb up the tree and find the button itself!
    $target = $(ev.target);
    $button = $target.closest('.control')

    // Next, apply the properties stored on this button to the Haiku.
    let data = $button.data();

    // If this button is an on/off toggle, we need to treat it differently.
    if ( data.toggleable ) {
      // Don't actually set the 'toggle' property on the haiku.
      data = _.omit(data, 'toggleable');
      _.keys(data).forEach( (dataKey) => {
        let current_value = instance.haiku.get(dataKey);
        instance.haiku.set(dataKey, !current_value);
      });
    } else {
      instance.haiku.set(data);
    }


  },

  /**
   *  Upload your own background image instead of using a preset.
   *  Uploads the file to S3 but latency-compensates by displaying it immediately.
   */
  'change .upload-background': function(ev, instance) {
    ev.preventDefault();

    // Mark the 'upload' button (instead of one of the preset thumbs) as selected.
    $('.background-select-option').removeClass('selected');
    $(ev.target).addClass('selected');

    // Send to S3!
    instance.uploader.send(ev.target.files[0], (error, image_url) => {
      if (error) {
        console.error('Error uploading', instance.uploader.xhr.response);
        alert (error);
      }
      instance.haiku.set( 'backgroundImage', image_url );
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

    let haiku = {
      body:             instance.haiku.get('body'),
      textColor:        instance.haiku.get('textColor'),
      textAlign:        instance.haiku.get('textAlign'),
      textValign:       instance.haiku.get('textValign'),
      backgroundImage:  instance.haiku.get('backgroundImage'),
      backgroundAlign:  instance.haiku.get('backgroundAlign'),
      backgroundValign: instance.haiku.get('backgroundValign'),
      showOverlay:      instance.haiku.get('showOverlay'),
      overlayColor:     instance.haiku.get('overlayColor'),
      overlayDirection: instance.haiku.get('overlayDirection')
    };

    // Rather than shove a bunch of validations here, they'll be held in the
    // colletion. They'll run simultaneously on client and server.

    Meteor.call('publishHaiku', haiku, (err, result) => {
      if (result == true) UiUtils.modal.deactivate();
    });
    // TODO: Redirect to my profile page so I can see the Haiku I just posted?
  }
});
