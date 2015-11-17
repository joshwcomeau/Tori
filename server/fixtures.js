Meteor.startup(function() {
  if ( Haikus.find().count() === 0 ) {
    // Create two users
    let poetId = Meteor.users.insert({
      username: 'thepoet',
      profile:  {
        displayName: 'The Malevolent Poet',
        summary: 'Aspiring poet who leaves everything to the imagination. Fond of cats, cars and cabins.',
        photo: '/images/default_avatar.jpg',
        url: 'www.tori.com/ThePoet'
      },
      haikus: 0,
      followers: 0,
      following: 0,
      impact: 3.4
    });
    let poet = Meteor.users.findOne(poetId);

    let rollingHillsId = Meteor.users.insert({
      username: 'rollinghills',
      profile: {
        displayName: 'Lush Rolling Hills',
        summary: 'Inspiration: Shakespear, Wordsworth, Mia Angelou.',
        photo: '/images/alternate_default_avatar.jpg',
        url: 'www.tori.com/rollinghills'
      },
      haikus: 0,
      followers: 0,
      following: 0,
      impact: 1.2
    });
    let rollingHills = Meteor.users.findOne(rollingHillsId);

    let haiku_id = Haikus.insert({
      body: 'Going to the store<br>shopping for groceries<br>still waters run deep',
      textColor: 'white',
      textAlign: 'left',
      textValign: 'bottom',
      showOverlay: false,
      showBackground: true,
      backgroundImage: '/images/sample-background-3.jpg',
      userId: rollingHillsId,
      createdAt: moment().subtract(33, 'minutes').toISOString(),
      retweets: 4
    });

    Haikus.insert({
      body: 'Green frog<br>is your body also<br>freshly painted?',
      textColor: 'black',
      textAlign: 'center',
      textValign: 'center',
      showOverlay: false,
      showBackground: false,
      userId: rollingHillsId,
      createdAt: moment().subtract(2, 'hours').toISOString(),
      likes: 2
    });

    Haikus.insert({
      body: 'Without flowing wine<br>How to enjoy lovely<br>Cherry blossom trees?',
      textColor: 'black',
      textAlign: 'left',
      textValign: 'center',
      showOverlay: false,
      showBackground: false,
      userId: poetId,
      createdAt: moment().subtract(2, 'hours').toISOString(),
      likes: 2
    });

    Follows.insert({
      fromUserId: rollingHillsId,
      toUserId:   poetId
    });

    Events.insert({
      type: 'like',
      seen: false,
      haikuId: haiku_id,
      toUserId: rollingHillsId,
      fromUserId: poetId
    });

    console.log("Fixture data inserted!");
  }
});
