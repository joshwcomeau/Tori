Template.compose.onCreated(function() {
  this.backgroundImage = new ReactiveVar(null);
  this.uploader = new Slingshot.Upload("medicalFile");
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
  
  'change .upload-background-button': function(ev, instance) {
    ev.preventDefault();
        
    let file = document.getElementById('files-upload-button').files[0];
    
    instance.uploader.send(file, (error, downloadUrl) => {
      if (error) {
        console.error('Error uploading', instance.uploader.xhr.response);
        alert (error);
      } else {
        Meteor.call('uploadFile', downloadUrl, (err, fileId) => {
          console.log("Client callback for file upload", err, fileId);
        });
      }
    });
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
