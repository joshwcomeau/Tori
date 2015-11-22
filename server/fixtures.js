Meteor.startup(function() {
  if ( Haikus.find().count() === 0 ) {
    // Add twitter OAuth details to DB
    ServiceConfiguration.configurations.upsert(
      { service: "twitter" },
      {
        $set: {
          loginStyle:   "popup",
          consumerKey:  Meteor.settings.TwitterConsumerKey,
          secret:       Meteor.settings.TwitterSecretKey
        }
      }
    );


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
      createdAt: moment().subtract(33, 'minutes').toDate(),
      likeCount: 0,
      shareCount: 0
    });

    Haikus.insert({
      body: 'Green frog<br>is your body also<br>freshly painted?',
      textColor: 'black',
      textAlign: 'center',
      textValign: 'center',
      showOverlay: false,
      showBackground: false,
      userId: rollingHillsId,
      createdAt: moment().subtract(2, 'hours').toDate(),
      likeCount: 0,
      shareCount: 0
    });

    Haikus.insert({
      body: 'Without flowing wine<br>How to enjoy lovely<br>Cherry blossom trees?',
      textColor: 'black',
      textAlign: 'left',
      textValign: 'center',
      showOverlay: false,
      showBackground: false,
      userId: poetId,
      createdAt: moment().subtract(2, 'hours').toDate(),
      likeCount: 0,
      shareCount: 0
    });

    Follows.insert({
      fromUserId: rollingHillsId,
      toUserId:   poetId
    });

    Events.insert({
      eventType:      'like',
      seen:           false,
      haikuId:        haiku_id,
      userId:         rollingHillsId,
      haikuAuthorId:  poetId
    });

    console.log("Fixture data inserted!");
  }
});
