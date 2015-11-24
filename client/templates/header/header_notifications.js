Template.headerNotifications.onCreated(function() {
  let instance = this;

  instance.menuName = 'headerNotifications';

  instance.autorun(() => {
    instance.subscribe('myNotifications');
  });
});

Template.headerNotifications.helpers({
  menuOpen: () => UiUtils.modal.isActive(Template.instance().menuName),
  hasUnreadNotifications: () => {
    return !!Notifications.findOne({ seen: false });
  },
  notifications: () => {
    return Notifications.find({}, {
      sort: { createdAt: -1 }
    });
  },

  profilePhoto: function() {
    let notification = Blaze.getData();
    return Meteor.users.findOne({ _id: notification.fromUserId }).profile.photo
  },
  notificationIcon: function() {
    let notification = Blaze.getData();
    switch (notification.notificationType) {
      case 'like':
        return 'heart';
      case 'share':
        return 'retweet';
      case 'reply':
        return 'reply';
      case 'follow':
        return 'user-plus';
    }
  },
  notificationText: function() {
    let notification = Blaze.getData();

    let userName = Meteor.users.findOne({
      _id: notification.fromUserId
    }).username;
    let userDisplayName = Meteor.users.findOne({
      _id: notification.fromUserId
    }).profile.displayName;

    if ( notification.haikuId ) {
      var haikuUrl = FlowRouter.path('haiku', {
        profile_name: Meteor.user().username,
        haiku_id: notification.haikuId
      });
    }

    let userUrl  = FlowRouter.path('profile', { profile_name: userName });

    switch (notification.notificationType) {
      case 'like':
        return `<a href="${userUrl}">${userDisplayName}</a> liked <a href="${haikuUrl}">your Haiku</a>.`
      case 'share':
        return `<a href="${userUrl}">${userDisplayName}</a> shared <a href="${haikuUrl}">your Haiku</a>.`
      case 'reply':
        return `<a href="${userUrl}">${userDisplayName}</a> has <a href="${haikuUrl}">replied</a> to your Haiku.`
      case 'follow':
        return `<a href="${userUrl}">${userDisplayName}</a> is now following you!`
    }
  }
});

Template.headerNotifications.events({
  // We have a window handler to close the login popup. We want this to run
  // except when the log-in menu, or one of its children, is clicked.
  // Because of how events bubble, this trick will ensure that any click
  // within the menu doesn't close the menu =)
  'mouseup .notifications-menu': (ev, instance) => ev.stopPropagation(),

  'mouseup .notifications-button': (ev, instance) => {
    UiUtils.modal.toggle(instance.menuName);
    ev.preventDefault();
    ev.stopPropagation();


  },

  // When clicking a link (eg. View all), we want to close the menu
  'click a': (ev, instance) => UiUtils.modal.deactivate(),

  'click .mark-as-seen': (ev, instance) => {
    // Its parent <li> has a data-event-id attribute, which holds the event
    // we're dismissing.
    let $li = $(ev.target).closest('li');
    let sourceId = $li.data('source-id');
    let sourceCollection = $li.data('source-name');

    Meteor.call('markAsSeen', sourceId, sourceCollection);
  }
});
