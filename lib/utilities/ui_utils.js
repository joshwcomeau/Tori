/** UI UTILS - Handles generic UI updates. */
UiUtils = {
  /**
   * Handles opening/closing modals (and menus)
   * Uses 'Session', which is best used sparingly, so this util should ONLY
   * be used for updates that can be triggered from all over the app.
   */
  modal: {
    getActive: () => Session.get('activeModal'),
    isActive: menu_name => Session.get('activeModal') === menu_name,
    activate: menu_name => Session.set('activeModal', menu_name),
    deactivate: () => Session.set('activeModal', null),
    toggle: menu_name => {
      Session.get('activeModal') === menu_name
      ? Session.set('activeModal', null)
      : Session.set('activeModal', menu_name);
    }

  }
};
