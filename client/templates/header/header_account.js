Template.headerAccount.onCreated(function() {
  this.menuName = 'headerAccount';
  UiUtils.menu.registerWindowClickHandler();
});

Template.headerAccount.helpers({
  menuOpen: function() {
    return UiUtils.menu.isActive(Template.instance().menuName);
  },
  profileLink: function() {
    return `/${this.username}`
  }
});

Template.headerAccount.events({
  'mouseup .account-menu': function(ev, instance) {
    ev.stopPropagation();
  },
  'mouseup .account-thumb': function(ev, instance) {
    ev.stopPropagation();
    UiUtils.menu.activate(instance.menuName);
  },
  'click a': function(ev, instance) {
    UiUtils.menu.deactivate();
  },
  'click .log-out-link': function(ev, instance) {
    Meteor.logout(function(err) {
      // TODO: Error handling
      if (err) console.error( "Error logging out:", err );
    });
  }
})
