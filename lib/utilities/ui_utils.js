/** UI UTILS - Handles generic UI updates. */


UiUtils = {
  /**
   * Handles opening/closing modals (and menus)
   * Uses 'Session', which is best used sparingly, so this util should ONLY
   * be used for updates that can be triggered from all over the app.
   */
  modal: {
    isActive: function(menu_name) {
      return Session.get('activeModal') === menu_name;
    },
    activate: function(menu_name) {
      Session.set('activeModal', menu_name);
    },
    deactivate: function() {
      Session.set('activeModal', null);
    }
  }
};
