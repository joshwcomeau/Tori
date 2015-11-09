Template.headerAccount.onCreated(function() {
  this.menuName = 'headerAccount';
  
  // TODO: DRY this up, it exists in two places.
  // Close the menu when a click event is registered anywhere outside the menu
  $(window).on('mouseup', (ev) => {
    this.loginMenuOpen.set(false);
  });
  

});

Template.headerAccount.helpers({})