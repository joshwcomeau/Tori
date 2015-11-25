Template.profileFollow.onCreated(function() {
});

Template.profileFollow.helpers({
  joinedOn: (ev, instance) => {
    let createdAt = Blaze.getData().createdAt;
    let formattedDate = moment(createdAt).format('MMMM Do YYYY');

    return `Joined on ${formattedDate}.`
  }
})
