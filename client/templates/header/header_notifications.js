Template.headerNotifications.onCreated(function() {
  this.menuName = 'headerNotifications';

  this.autorun(() => {
    this.subscribe('myNotifications')
  });
});

Template.headerNotifications.helpers({
  menuOpen: () => UiUtils.modal.isActive(Template.instance().menuName),
  hasUnreadNotifications: () => {
    return !!Events.findOne({ seen: false, haikuAuthorId: Meteor.userId() });
  },
  notifications: () => {
    return Events.find({
      seen: false,
      haikuAuthorId: Meteor.userId()
    }, {
      sort: { createdAt: -1 }
    });
  },

  // These fields are called with the Notification context (an Event instance)
  avatar: function() {
    return Meteor.users.findOne({ _id: this.userId }).profile.photo
  },
  eventIcon: function() {
    switch (this.eventType) {
      case 'like':
        return 'heart';
      case 'share':
        return 'retweet';
      case 'reply':
        return 'reply';
    }
  },
  notificationText: function() {
    let userName = Meteor.users.findOne({ _id: this.userId }).username;
    let userDisplayName = Meteor.users.findOne({ _id: this.userId }).profile.displayName;

    let haikuUrl = FlowRouter.path('haiku', {
      profile_name: Meteor.user().username,
      haiku_id: this.haikuId
    });
    let userUrl  = FlowRouter.path('profile', { profile_name: userName });

    switch (this.eventType) {
      case 'like':
        return `<a href="${userUrl}">${userDisplayName}</a> liked <a href="${haikuUrl}">your Haiku</a>.`
      case 'share':
        return `<a href="${userUrl}">${userDisplayName}</a> shared <a href="${haikuUrl}">your Haiku</a>.`
      case 'reply':
        return `<a href="${userUrl}">${userDisplayName}</a> has <a href="${haikuUrl}">replied</a> to your Haiku.`
    }
  }
});

Template.headerNotifications.events({
  // We have a window handler to close the login popup. We want this to run
  // except when the log-in menu, or one of its children, is clicked.
  // Because of how events bubble, this trick will ensure that any click
  // within the menu doesn't close the menu =)
  'mouseup .notifications-menu': (ev, instance) => ev.stopPropagation(),

  'click .notifications-button': (ev, instance) => {
    ev.preventDefault();
    ev.stopPropagation();

    UiUtils.modal.activate(instance.menuName);
  },

  // When clicking a link (eg. View all), we want to close the menu
  'click a': (ev, instance) => UiUtils.modal.deactivate()
})
