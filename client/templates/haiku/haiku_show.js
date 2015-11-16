Template.haikuShow.onCreated(function() {
  this.autorun( () => {
    this.subscribe('activeHaiku', FlowRouter.getParam('haiku_id'));
  });
});

Template.haikuShow.helpers({
  selectedHaiku: () => {
    return Haikus.findOne( FlowRouter.getParam('haiku_id') );
  }
})
