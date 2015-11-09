UiUtils = {
  menu: {
    registerWindowClickHandler: function() {
      // Close any active menu when a click event is registered anywhere outside the menu
      $(window).on('mouseup', (ev) => {
        Session.set('activeMenu', null);
      });
    },
    isMenuActive: function(menu_name) {
      return Session.get('activeMenu') === menu_name;
    },
    activate: function(menu_name) {
      Session.set('activeMenu', menu_name);
    }
  }
}