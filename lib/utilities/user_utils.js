UserUtils = {
  findUserByProfileName: function(profile_name) {
    if ( !profile_name ) console.error("Tried fetching profile by name, but no name was provided, or available in the route.");
    
    let profile = Meteor.users.findOne({ username: profile_name });
    
    if ( !profile ) {
      console.error(`Could not find a user object with profile name ${profile_name}`);
      // Return an empty object, so that we don't break the templates that expect
      // a user object.
      return {}
    }

    return profile;
  },
  isCurrentUserFollowing: function(profile_name) {
    let user_id = this.findUserByProfileName(profile_name)._id;
    return !!Follows.findOne({ toUserId: user_id });
  }
}
