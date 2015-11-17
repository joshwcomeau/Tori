Template.haikuEvent.helpers({
  eventIconAttrs: function() {
    let iconClass = this.type === "like" ? "heart" : "retweet";

    return {
      class: `fa fa-${iconClass}`
    };
  },
  eventName: function() {
    return "Liked";
  },
  eventTimestamp: function() {
    return moment(this.createdAt).format("MMMM Do YYYY, h:mm a");
  },
  authorDisplayName: function() {
    return Meteor.users.findOne(this.fromUserId).profile.displayName;
  },
  authorProfileUrl: function() {
    return Meteor.users.findOne(this.fromUserId).username;
  }
})
