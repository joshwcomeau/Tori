Template.headerAccount.onCreated(function() {
  this.menuName = 'headerAccount';
});

Template.headerAccount.helpers({
  menuOpen: function() {
    return UiUtils.modal.isActive(Template.instance().menuName);
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
    UiUtils.modal.activate(instance.menuName);
  },
  'click a': function(ev, instance) {
    UiUtils.modal.deactivate();
  },
  'click .log-out-link': function(ev, instance) {
    Meteor.logout(function(err) {
      // TODO: Error handling
      if (err) console.error( "Error logging out:", err );
    });
  }
})
