Template.body.onCreated(   () => $(window).on('mouseup', UiUtils.modal.deactivate) );
Template.body.onDestroyed( () => $(window).off('mouseup', UiUtils.modal.deactivate) );

Template.body.events({});
