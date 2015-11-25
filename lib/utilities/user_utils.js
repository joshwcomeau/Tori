UserUtils = {
  findUserByProfileName: function(profileName) {
    if ( !profileName ) {
      return undefined;
    }

    profileName = profileName.toLowerCase();

    let profile = Meteor.users.findOne({ username: profileName });

    if ( !profile ) {
      console.error(`Could not find a user object with profile name ${profileName}`);
      // Return an empty object, so that we don't break the templates that expect
      // a user object.
      return undefined;
    }

    return profile;
  },
  isCurrentUserFollowing: function(profileName) {
    profileName = profileName.toLowerCase();

    let user_id = this.findUserByProfileName(profileName)._id;
    return !!Follows.findOne({ toUserId: user_id });
  }
}
