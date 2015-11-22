Template.haikuEvent.helpers({
  eventIconAttrs: function() {
    let iconClass = this.eventType === "like" ? "heart" : "retweet";

    return {
      class: `fa fa-${iconClass}`
    };
  },
  eventName: function() {
    return _.capitalize(this.eventType)+"d";
  },
  eventTimestamp: function() {
    return moment(this.createdAt).format("MMMM Do YYYY, h:mm a");
  },
  userDisplayName: function() {
    return Meteor.users.findOne(this.userId).profile.displayName;
  },
  userProfileUrl: function() {
    return Meteor.users.findOne(this.userId).username;
  }
})
