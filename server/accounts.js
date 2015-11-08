Accounts.onCreateUser(function(options, user) {
  user.profile = user.profile || {};
  
  user.profile.url = `www.tori.com/${user.username}`;
  
  user.haikus     = 0;
  user.followers  = 0;
  user.following  = 0;
  
  return user;
});
