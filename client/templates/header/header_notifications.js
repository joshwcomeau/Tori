Template.headerNotifications.onCreated(function() {
  let instance = this;

  instance.menuName = 'headerNotifications';

  instance.autorun(() => {
    instance.subscribe('myNotifications');

    let eventQuery = {
      seen: false, haikuAuthorId: Meteor.userId(), eventType: { $ne: 'haiku'}
    };

    let followQuery = {
      seen: false, toUserId: Meteor.userId()
    };

    // `myNotifications` publishes both unseen Events and unseen Follows.
    // We want to combine them into a local-only collection, Notifications,
    // and sort by createdAt.

    // We have a standardized
    Follows.find( followQuery ).observe({
      added:    (item) => {
        let notification = _.extend(item, {
          sourceCollection: 'follows',
          eventType:        'follow'
        });
        Notifications.insert(notification);
      },
      removed:  (item) => Notifications.delete(item._id),
      changed:  (newItem, oldItem) => {
        let notification = _.extend(newItem, {
          sourceCollection: 'follows',
          eventType:        'follow'
        });
        Notifications.update(oldItem._id, notification);
      }
    });

    // For Events, we're doing some modifications, so that they match the 'follow' syntax.
    Events.find( eventQuery ).observe({
      added:    (item) => {
        let notification = _.extend(item, {
          sourceCollection: 'events',
          fromUserId:       item.userId,
          toUserId:         item.haikuAuthorId
        });
        Notifications.insert(notification);
      },
      removed:  (item) => Notifications.delete(item._id),
      changed:  (newItem, oldItem) => {
        let notification = _.extend(newItem, {
          sourceCollection: 'events',
          fromUserId:       item.userId,
          toUserId:         item.haikuAuthorId
        });
        Notifications.update(oldItem._id, notification);
      }
    });
  });
});

Template.headerNotifications.helpers({
  menuOpen: () => UiUtils.modal.isActive(Template.instance().menuName),
  hasUnreadNotifications: () => {
    return !!Events.findOne({ seen: false, haikuAuthorId: Meteor.userId() });
  },
  notifications: () => {
    return Notifications.find({}, {
      sort: { createdAt: -1 }
    });
  },

  avatar: function() {
    let notification = Blaze.getData();
    return Meteor.users.findOne({ _id: notification.fromUserId }).profile.photo
  },
  eventIcon: function() {
    let notification = Blaze.getData();
    switch (notification.eventType) {
      case 'like':
        return 'heart';
      case 'share':
        return 'retweet';
      case 'reply':
        return 'reply';
      case 'follow':
        return 'user-plus'
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
    console.log(notification)
    switch (notification.eventType) {
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
    let eventId = $(ev.target).closest('li').data('event-id');

    Meteor.call('markAsSeen', eventId);
  }
})
