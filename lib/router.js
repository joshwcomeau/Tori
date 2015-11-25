// Current planned structure:
// `/` is your feed of chirps from the people you're following.
// `/:profile_name` is that user's chirps.
// `/notifications` is a list of events (likes, retweets, new follows)
// `/hashtag/:hashtag` is all the chirps for a given keyword.
// `/register` is what you'd think.

FlowRouter.route('/', {
  action: function(params, queryParams) {
    BlazeLayout.render('mainLayout', {
      sidebar:  'sidebar',
      main:     'feed'
    });
  }
});

FlowRouter.route('/register', {
  action: function(params, queryParams) {
    BlazeLayout.render('noSidebarLayout', {
      main:     'register'
    });
  }
});

FlowRouter.route('/popular', {
  name: 'popular',
  action: function(params, queryParams) {
    BlazeLayout.render('noSidebarLayout', {
      main:     'popularHaikus'
    });
  }
});

FlowRouter.route('/:profile_name/haikus/:haiku_id', {
  name: 'haiku',
  action: function(params, queryParams) {
    BlazeLayout.render('noSidebarLayout', {
      main:     'haikuShow'
    });
  }
});

FlowRouter.route('/:profile_name', {
  name: 'profile',
  action: function(params, queryParams) {
    BlazeLayout.render('profileLayout', {
      sidebar:  'sidebar',
      main:     'profileHaikusList'

    });
  }
});

FlowRouter.route('/:profile_name/followers', {
  name: 'profileFollowers',
  action: function(params, queryParams) {
    BlazeLayout.render('profileLayout', {
      sidebar:  'sidebar',
      main:     'profileFollowers'

    });
  }
});

FlowRouter.route('/:profile_name/following', {
  name: 'profileFollowing',
  action: function(params, queryParams) {
    BlazeLayout.render('profileLayout', {
      sidebar:  'sidebar',
      main:     'profileFollowing'

    });
  }
});
