Template.profileFollow.onCreated(function() {
});

Template.profileFollow.helpers({
  joinedOn: (ev, instance) => {
    let createdAt = Blaze.getData().createdAt;
    return moment(createdAt).format('MMMM Do YYYY');
  },
  defaultSummary: (ev, instance) => {
    return 'No summary found.\nMaybe they will add one soon?\nKeep your fingers crossed.'
  }
})
