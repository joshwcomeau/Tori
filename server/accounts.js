OAuth = Meteor.npmRequire('oauth');

Accounts.onCreateUser(function(options, user) {
  user.profile = user.profile || {};
  
  // If coming from Twitter, we wanna use a bunch of their twitter info.
  if ( user.services.twitter ) {
    let twitter_info    = user.services.twitter;
    
    // Make a request to Twitter to get the rest of their data.
    Async.runSync(function(done) {
      let twitter_oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        Meteor.settings.TwitterConsumerKey,
        Meteor.settings.TwitterSecretKey,
        '1.0A',
        null,
        'HMAC-SHA1'
      );
      
      let url = `https://api.twitter.com/1.1/users/show.json?screen_name=${twitter_info.screenName}`;
      
      let accessToken = twitter_info.accessToken;
      let accessTokenSecret = twitter_info.accessTokenSecret;
      twitter_oauth.get(url, accessToken, accessTokenSecret, (err, data, response) => {
        if (err) console.log(err);
        
        data = JSON.parse(data);
        
        if (data) {
          user.username             = data.screen_name;
          user.profile.displayName  = data.name;
          user.profile.location     = data.lodation;
          user.profile.summary      = data.description;
          user.profile.url          = data.url;
          user.profile.photo        = data.profile_image_url.replace(/_normal/i, '');
        }
        
        return done(err, user);
      });
    });
    
    return user;
  } else {
    user.profile.url = `www.tori.com/${user.username}`;
    
    user.haikus     = 0;
    user.followers  = 0;
    user.following  = 0;
    
    return user;
  }
});
