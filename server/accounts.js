Accounts.onCreateUser(function(options, user) {
  user.profile = user.profile || {};
  
  user.profile.url = `www.tori.com/${user.username}`;
  
  return user;
});
